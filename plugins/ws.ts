import {
  arr,
  IAccount,
  IClient,
  IFavorite,
  IIdent,
  IMailerTemplate,
  IMessage,
  IUser,
  TChat,
  IStoreWS,
  EContactStatus, IClientProfile, IClientState, IAfterChatText, TContact
} from "~/types/core";
import Vue from 'vue'

interface IData {
  user: IUser | null,
  operator: IUser | null,
  startWorkTimestamp: number,
  chats: TChat[],
  stat: {
    activeMailers: number
  },

}

class WS {
  socket: WebSocket | null = null
  store = {
    media: {message: new Audio('/media/message.mp3')},
    loading: {profiles: false, states: false},
    operator: null,
    state: {
      theme: localStorage.getItem('theme') || 'light',
      started: false,
      workedTime: 0,
      operatorId: '',
      unanswered: 0
    },
    afterChatTextPanel: {
      templates: [],
      current: {},
      account: null,
      client: null,
      messagesCount: 0
    }
  } as unknown as IStoreWS

  connect(token) {
    if (this.socket) {
      return
    }
    this.socket = new WebSocket('ws://' + (process.env.API_HOST || location.hostname + ':7777') + '/ws/' + token)
    this.socket.onclose = () => {
      this.socket = null
    }
    this.socket.onmessage = (evt: MessageEvent) => {
      const data = JSON.parse(evt.data)
      switch (data.type) {
        case 'init':
          this.initHandler(data.payload)
          // this.metricConnect()
          // this.loadAfterChatTemplate()
          this.loadMailerTemplates()
          break
        case 'message':
          this.messageHandler(data.ident, data.payload)
          break
        case 'favorite':
          this.favoriteHandler(data.ident, data.payload)
          break
        case 'hide-account':
          this.hideAccountHandler(data.payload)
          break
      }
    }

    this.socket.onclose = (e) => {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      this.socket = null
      setTimeout(() => {
        this.connect(token);
      }, 1000);
    };
    this.socket.onerror = function (evt) {
      console.error('Socket error observed:', evt)
    }
  }

  disconnect() {
    this.socket = null
  }

  initHandler(payload: IData) {
    if (payload.chats) {
      this.store.chats = []
      this.store.user = payload.user
      this.store.stat = payload.stat;
      for (let i = 0; i < payload.chats.length; i++) {
        this.store.chats.push(new TChat(payload.chats[i]))
      }

      this.store.chats = this.store.chats.sort((a: TChat, b: TChat) => {
        return b.lastTimestamp() - a.lastTimestamp()
      })
    }
    if (payload.operator) {
      this.store.operator = payload.operator
      this.store.state.operatorId = String(payload.operator.id)
      this.store.state.started = true
      this.store.state.workedTime = payload.startWorkTimestamp
    }

    this.recalculateUnanswered()
  }

  loadAfterChatTemplate() {
    if (this.store.components.afterChatTextPanel.account) {
      return;
    }

    interface ITemplate {
      id: number | null
      subject: string
      text: string
    }

    interface IResponse {
      account: IAccount,
      client: IClient,
      templates: ITemplate[],
      current: ITemplate | null,
      messagesCount: number
    }

    const params = {userId: this.store.user!.id}
    fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/after-chat-text/' + JSON.stringify(params))
      .then((response: Body) => response.json())
      .then((result: IResponse) => {
        const state = this.store.components.afterChatTextPanel;
        if (result) {
          state.account = result.account
          state.client = result.client
          state.templates = result.templates
          state.messagesCount = result.messagesCount
          if (result.current) {
            state.current = result.current
          } else {
            state.current = {id: null, subject: '', text: ''}
          }
        } else {
          state.templates = []
          state.current = {id: null, subject: '', text: ''}
          state.account = null
          state.client = null
        }
      });
  }

  loadMailerTemplates() {
    if (this.store.components.mailerPanel.loading) {
      return
    }

    interface IResponse {
      [index: number]: {
        account: IAccount,
        templates: IMailerTemplate[],
      }
    }

    const params = {userId: this.store.user!.id, pass: [] as number[]}
    for (const i in this.store.components.mailerPanel.state) {
      const item = this.store.components.mailerPanel.state[i]
      params.pass.push(item.account!.id)
    }

    this.store.components.mailerPanel.loading = true
    fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/mailer-not-running-templates/' + JSON.stringify(params))
      .then((response: Body) => response.json())
      .then((result: IResponse) => {
        this.store.components.mailerPanel.loading = false
        if (result) {
          for (const i in result) {
            const state: any = this.store.components.mailerPanel.state
            state.push(result[i])
          }
        }
      })
  }

  messageHandler(ident: IIdent, payload: IMessage) {
    const chat = this.getChat(ident.girlSiteId, ident.type)
    if (chat) {
      if (!payload.wink || chat.account.favorites.includes(payload.manId)) {
        if (payload.inbox) {
          this.store.media.message.play()
        }

        if (payload.inbox && chat.contacts.length == 0) {
          if (chat.contacts.length == 0) {
            this.store.chats.push(this.store.chats.splice(this.store.chats.indexOf(chat), 1)[0]);
          }
        }
        // @ts-ignore
        chat.addMessage(payload)

        if (payload.present) {
          const present = {
            message: payload,
            type: ident.type,
            accountId: ident.girlSiteId,
            clientId: payload.manId
          }
          // @ts-ignore
          this.components.presentsPanel.push(present)
        }
        this.recalculateUnanswered()
      }
    }
  }

  getChat(accountId: number, type: string): TChat | null {
    for (let i = 0; i < this.store.chats.length; i++) {
      const chat = this.store.chats[i]
      if (chat.account.id == accountId && chat.account.type == type) {
        return chat
      }
    }
    return null
  }

  favoriteHandler(ident: IIdent, payload: IFavorite) {
    const chat = this.getChat(ident.girlSiteId, ident.type)
    if (chat) {
      for (const i in chat.contacts) {
        const contact = chat.contacts[i]
        if (contact.id == payload.manId) {
          contact.state.favorite = payload.state
        }
      }

      if (payload.state) {
        chat.account.favorites.push(payload.manId)
      } else {
        arr.remove(chat.account.favorites, payload.manId)
      }
    }
  }

  hideAccountHandler(id: number) {
    for (let i = 0; i < this.store.chats.length; i++) {
      if (this.store.chats[i].account.id == id) {
        this.store.chats.splice(i, 1)
      }
    }
  }

  recalculateUnanswered() {
    let result = 0
    for (const i in this.store.chats) {
      for (const j in this.store.chats[i]?.contacts) {
        if (this.store.chats[i].contacts[j].status !== EContactStatus.Normal) {
          result++
        }
      }
    }
    this.store.state.unanswered = result
  }

  loadProfiles() {
    interface IParams {
      userId: number,
      payload: { [key: string]: number[] }
    }

    interface IResponse {
      [key: string]: {
        [key: number]: IClientProfile
      }
    }

    if (this.store.user && !this.store.loading.profiles) {
      this.store.loading.profiles = true
      const params: IParams = {
        userId: this.store.user.id,
        payload: {}
      }

      for (const i in this.store.chats) {
        const chat = this.store.chats[i]
        if (chat?.profileQueue.length) {
          const key = chat.account.id + '_' + chat.account.type
          if (!params.payload[key]) {
            params.payload[key] = []
          }
          Array.prototype.push.apply(params.payload[key], chat.profileQueue)
          chat.profileQueue = []
        }
      }

      if (!Object.keys(params.payload).length) {
        this.store.loading.profiles = false
        return
      }

      for (const key in params.payload) {
        params.payload[key] = arr.unique(params.payload[key])
      }

      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/contact-profiles/' + JSON.stringify(params))
        .then((response: Body) => response.json())
        .then((result: IResponse) => {
          this.store.loading.profiles = false
          for (const ident in result) {
            const [accountId, type] = ident.split('_')
            const chat = this.getChat(Number(accountId), type)
            if (chat) {
              const profiles = result[ident]
              for (const clientId in profiles) {
                const profile = profiles[clientId]
                for (const i in chat.contacts) {
                  if (chat.contacts[i].id == Number(clientId)) {
                    chat.contacts[i].profile = profile
                    break
                  }
                }
              }
              chat.contacts = [...chat.contacts]
            }
          }
        })
    }
  }

  loadStates() {
    interface IParams {
      userId: number,
      payload: { [key: string]: number[] }
    }

    interface IResponse {
      [key: string]: {
        [key: number]: IClientState
      }
    }

    if (this.store.user && !this.store.loading.states) {
      this.store.loading.states = true
      const params: IParams = {
        userId: this.store.user.id,
        payload: {}
      }

      for (const i in this.store.chats) {
        const chat = this.store.chats[i]
        if (chat?.stateQueue.length) {
          const key = chat.account.id + '_' + chat.account.type
          if (!params.payload[key]) {
            params.payload[key] = []
          }
          Array.prototype.push.apply(params.payload[key], chat.stateQueue)
          chat.stateQueue = []
        }
      }

      if (!Object.keys(params.payload).length) {
        this.store.loading.states = false
        return
      }

      for (const key in params.payload) {
        params.payload[key] = arr.unique(params.payload[key])
      }

      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/contact-states/' + JSON.stringify(params))
        .then((response: Body) => response.json())
        .then((result: IResponse) => {
          this.store.loading.states = false
          for (const ident in result) {
            const [accountId, type] = ident.split('_')
            const chat = this.getChat(Number(accountId), type)
            if (chat) {
              const states = result[ident]
              for (const clientId in states) {
                const state = states[clientId]
                for (const i in chat.contacts) {
                  if (chat.contacts[i].id == Number(clientId)) {
                    chat.contacts[i].state = state
                    break
                  }
                }
              }
            }
          }
        })
    }
  }

  fillProfileQueues() {
    for (const i in this.store.chats) {
      const chat = this.store.chats[i]
      for (const j in chat?.contacts) {
        const contact = chat.contacts[j]
        if (!contact?.profile) {
          chat.profileQueue.push(contact.id)
        }
      }
    }
  }

  loadCountActiveMailers() {
    interface IResponse {
      countActiveMailers: number,
    }

    const params = {userId: this.store.user!.id}

    fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/count-active-mailers/' + JSON.stringify(params))
      .then((response: Body) => response.json())
      .then((result: IResponse) => {
        if (result) {
          this.store.stat!.activeMailers = result.countActiveMailers
        }
      })
  }

  startStop() {
    const params = {} as {
      operatorId: number,
      earnOperatorId: number,
    }

    interface IResponse {
      startTime: number,
    }


    params.operatorId = this.store.user!.id
    params.earnOperatorId = parseInt(this.store.state.operatorId)

    if (!this.store.state.started) {
      if (!this.store.state.operatorId) {
        alert('Enter the ID of the operator')
      } else if (!parseInt(this.store.state.operatorId)) {
        alert('Error entering ID')
      } else {
        fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/user/' + parseInt(this.store.state.operatorId))
          .then((response: Body) => response.json())
          .then((operator: IUser) => {
            if (!operator) {
              return
            }
            if (confirm('Operator ' + operator.name + ' (id: ' + operator.id + ').\nStart?')) {
              fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/chat/start/' + JSON.stringify(params))
                .then((response: Body) => response.json())
                .then((result: IResponse) => {
                  if (result) {
                    this.store.state.workedTime = result.startTime
                  } else {
                    this.store.state.workedTime = Math.floor(Date.now() / 1000)
                  }
                  this.store.operator = operator
                  this.store.state.started = true
                })
            }
          })
      }
    } else {
      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/chat/stop/' + JSON.stringify(params))
        .then((response: Body) => response.json())
        .then(() => {
          this.store.state.started = false
          this.store.operator = null
        })
    }
  }

  removeOfflineContacts() {
    let chatID = [] as TContact[];
    for (const chat of this.store.chats) {
      if (chat.contacts.length) {
        for (const contact of chat.contacts){
          if (contact.history.messages.length) {
            for (const message of contact.history.messages) {
              if (contact.history.messages[contact.history.messages.length - 1].inbox) {
                let dayNow = new Date()
                let ts = new Date(message.timestamp * 1000)
                let difference = (new Date(dayNow).getTime() - new Date(ts).getTime())/60000
                if (Math.floor(difference) >= 4) {
                  chatID.push(contact)
                }
              }
            }
          } else {
            chatID.push(contact)
          }
        }
        arr.removeAll(chat.contacts, chatID)
      }
    }

  }


  constructor() {
    const vm = new Vue({
      data: {
        store: this.store,
        operator: this.store.operator,
        connect: this.connect,
        disconnect: this.disconnect,
        initHandler: this.initHandler,
        loadAfterChatTemplate: this.loadAfterChatTemplate,
        loadMailerTemplates: this.loadMailerTemplates,
        messageHandler: this.messageHandler,
        getChat: this.getChat,
        favoriteHandler: this.favoriteHandler,
        hideAccountHandler: this.hideAccountHandler,
        recalculateUnanswered: this.recalculateUnanswered,
        loadProfiles: this.loadProfiles,
        loadStates: this.loadStates,
        fillProfileQueues: this.fillProfileQueues,
        loadCountActiveMailers: this.loadCountActiveMailers,
        startStop: this.startStop,
        removeOfflineContacts: this.removeOfflineContacts,
      }
    });


    this.store = vm.store;
    this.store.operator = vm.operator;
    this.connect = vm.connect;
    this.disconnect = vm.disconnect;
    this.initHandler = vm.initHandler;
    this.loadAfterChatTemplate = vm.loadAfterChatTemplate;
    this.loadMailerTemplates = vm.loadMailerTemplates;
    this.messageHandler = vm.messageHandler;
    this.getChat = vm.getChat;
    this.favoriteHandler = vm.favoriteHandler;
    this.hideAccountHandler = vm.hideAccountHandler;
    this.recalculateUnanswered = vm.recalculateUnanswered;
    this.loadProfiles = vm.loadProfiles;
    this.loadStates = vm.loadStates;
    this.fillProfileQueues = vm.fillProfileQueues;
    this.loadCountActiveMailers = vm.loadCountActiveMailers;
    this.startStop = vm.startStop;
    this.removeOfflineContacts = vm.removeOfflineContacts;
  }


}

export default new WS();
