export const arr = {
  remove(array: any[], value: any) {
    const index = array.indexOf(value as never)
    if (index > -1) {
      return array.splice(index, 1)
    }
  },
  removeAll(array: any[], values: any[]) {
    for (const value of values) {
      this.remove(array, value)
    }
  },
  unique(array: any[]) {
    return [...new Set(array)]
  }
}

export class TObject {
  constructor(data?: Partial<TObject>) {
    if (data) {
      Object.assign(this, data)
    }
  }
}

export interface IUser {
  id: number
  name: string
  city: string
  avatar: string
}

export interface IEvent {
  type: string
  timestamp?: number
  ident: IIdent | null
  payload: object | null
}

export class TEvent extends TObject implements IEvent {
  constructor(data: IEvent) {
    super(data)
    if (!this.timestamp) {
      this.timestamp = Math.round(Date.now() / 1000)
    }
  }

  type: string
  timestamp: number
  ident: IIdent | null
  payload: object | null
}

export interface IIdent {
  userId: number
  girlSiteId: number
  type: string
}

export interface IGirlIdent {
  girlSiteId: number
  type: string
}

export interface IManIdent {
  manId: number
}

export interface IMessage {
  messageId: number
  type?: string
  timestamp: number
  manId: number
  inbox: boolean
  letter: boolean
  wink: boolean
  present: boolean
  text: string,
  message?: string
}

export interface IPresent {
  message: IMessage
  type: string
  accountId: string
  clientId: number
}

export interface IStickers {
  stickers: IStickersGroup[],
  smiles: IStickersGroup[]
}

export interface IStickersGroup {
  group: string,
  stickers: ISticker[]
}

export interface ISticker {
  src: string,
  name: string
}

export interface IPhoto {
  id: number,
  src: string
}

export interface IMediaPhoto {
  src: string
  thumb: string
}

export interface IVideo {
  id: number,
  src: string,
  title: string
}

export interface ISendPhoto {
  id: number,
  manId: number
}

export interface ISendVideo {
  id: number,
  manId: number
}

export interface ISendSticker {
  sticker: string,
  manId: number
}

export interface IFavorite {
  manId: number
  state: boolean
}

export interface IAfterChatText {
  id: number | null
  subject: string
  text: string
}

// chat

export interface IChatAccount {
  id: number,
  extraId: number,
  type: string,
  avatar: string,
  name: string,
  city: string,
  birthdate: string,
  comment: string,
  hasPhotos: string,
  hasVideos: string,
  favorites: number[]
}

export interface IAccount {
  id: number,
  extraId: number,
  type: string,
  avatar: string,
  name: string,
  photos?: []
}

export interface IChat {
  account: IChatAccount
  contacts: TContact[]
}

export class TChat extends TObject implements IChat {
  constructor(data: IChat) {
    super(data)
    if (this.contacts.length) {
      let max = 0
      let selected: TContact | null = null
      for (let i = 0; i < this.contacts.length; i++) {
        const contact = new TContact(this.contacts[i])
        if (!contact.profile) {
          this.profileQueue.push(contact.id)
        }
        if (!contact.state) {
          this.stateQueue.push(contact.id)
        }
        this.contacts[i] = contact
        if (contact.history.messages.length == 1) {
          if (contact.history.messages[0].timestamp > max) {
            max = contact.history.messages[0].timestamp
            selected = contact
          }
        } else {
          contact.history.messages = contact.history.messages.sort((a, b) => {
            if (a.timestamp > max) {
              max = a.timestamp
              selected = contact
            }
            return a.timestamp! - b.timestamp!
          })
          contact.history.messages = contact.history.messages.filter(item => item.messageId !== 0);
        }
        contact.updateStatus()
      }
      this.selectedContact = selected
    }
  }

  account: IChatAccount
  contacts: TContact[]
  selectedContact: TContact | null = null
  profileQueue: number[] = []
  stateQueue: number[] = []
  onContactSelect: (contact: TContact) => void
  onMessage: (contact: TContact, message: IMessage) => void

  addMessage(payload: IMessage) {
    // Add to exists contact
    for (let i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i].id == payload.manId) {
        const existMes = this.contacts[i].history.messages.find((v: IMessage) => {
          return (payload.messageId == v.messageId)
        })
        if (existMes) {
          return
        }

        if (!payload.inbox) {
          const exists = this.history().messages.find((v: IMessage) => {
            return ((payload.messageId ? v.timestamp : !v.timestamp) && (v.text == payload.text))
          })

          if (exists) {
            exists.messageId = payload.messageId
            exists.timestamp = payload.timestamp
            const text = exists.text
            exists.text = ''
            setTimeout(() => {
              exists.text = text
            })
          } else {
            this.contacts[i].history.addMessage(payload)
            this.contacts[i].seen = true
          }
        } else {
          this.contacts[i].history.addMessage(payload)
          this.contacts[i].seen = false
        }

        this.contacts[i].updateStatus()
        this.contacts = [...this.contacts]
        if (!this.selectedContact) {
          this.selectedContact = this.contacts[i]
        }
        if (this.onMessage) {
          setTimeout(() => {
            this.onMessage(this.contacts[i], payload)
          })
        }

        return
      }
    }

    // Add to new contact
    if (payload.inbox) {
      const contact = new TContact(<IContact>{
        id: payload.manId,
        history: new THistory()
      })

      contact.history.addMessage(payload)
      this.profileQueue.push(payload.manId)
      this.stateQueue.push(payload.manId)
      this.contacts.push(contact)
      if (!this.selectedContact) {
        this.selectedContact = contact
      }
      if (this.onMessage) {
        setTimeout(() => {
          this.onMessage(contact!, payload)
        })
      }
    }
  }

  setContact(contact: TContact, passQueues = false) {
    let exists: number | null = null
    for (const i in this.contacts) {
      if (this.contacts[i].id == contact.id) {
        exists = Number(i)
        break
      }
    }
    if (exists !== null) {
      this.contacts[exists] = contact
    } else {
      this.contacts.push(contact)
    }

    if (!passQueues) {
      if (!contact.profile) {
        this.profileQueue.push(contact.id)
      }

      if (!contact.state) {
        this.stateQueue.push(contact.id)
      }
    }
  }

  removeContact(contact: TContact) {
    arr.remove(this.contacts, contact)
    if (!this.contacts.length) {
      this.selectedContact = null
    } else if (contact == this.selectedContact || this.contacts.length == 1) {
      this.selectedContact = this.contacts[0]
    }
  }

  clearContacts(contact: TContact) {
    this.contacts = [contact];
  }

  selectContact(contact: TContact) {
    contact.updateStatus(true)
    this.contacts = [...this.contacts]
    this.selectedContact = contact
    if (this.onContactSelect) {
      setTimeout(() => {
        this.onContactSelect(contact)
      })
    }
  }

  history(): THistory {
    if (this.selectedContact) {
      return this.selectedContact.history
    } else {
      return new THistory()
    }
  }

  lastTimestamp(): number {
    let max = 0
    for (const i in this.contacts) {
      const history = this.contacts[i].history
      const timestamp = history.lastTimestamp()
      if (timestamp > max) {
        max = timestamp
      }
    }
    return max
  }
}

// history

export interface IHistory {
  messages: IMessage[]
}

export class THistory extends TObject implements IHistory {
  constructor(data?: IHistory) {
    super(data)
    if (!this.messages) {
      this.messages = []
    }
  }

  messages: IMessage[]

  addMessage(message: IMessage) {
    // add new message
    if (message.timestamp) {
      let added = false
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (message.timestamp! > this.messages[i].timestamp!) {
          this.messages.splice(i + 1, 0, message)
          added = true
          break
        }
      }
      if (!added) {
        this.messages.unshift(message)
      }
    } else {
      this.messages.push(message)
    }

    // delete duplicates messages from history
    if (!message.inbox && message.type !== 'R') {
      this.messages = this.messages.filter(item => item.messageId !== 0);
    }
  }

  lastTimestamp(): number {
    if (this.messages.length) {
      return this.messages[this.messages.length - 1].timestamp
    }
    return 0
  }

  isTodayMessage(message: IMessage): boolean {
    const date = new Date(message.timestamp)
    const today = new Date(Date.now() / 1000)
    return date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear()
  }
}

// contact

export enum EContactStatus {
  Normal,
  HasUnreadMessages,
  HasForgottenMessages,
  NewFavouriteContact,
}

export interface IClientProfile {
  name: string
  avatar: string
  vip: boolean,
  birthday: boolean
}

export interface IClientState {
  payable: boolean,
  favorite: boolean,
  hasChats: boolean,
  blocked: boolean,
}

export interface IClient {
  id: number
  profile: IClientProfile | null
}

export interface IContact {
  id: number
  profile: IClientProfile | null
  state: IClientState | null
  history: THistory | null

}

export class TContact extends TObject implements IContact {
  constructor(data: IContact) {
    super(data)
    this.history = new THistory(this.history)
  }

  id: number
  profile: IClientProfile
  state: IClientState
  history: THistory
  seen: boolean
  status: EContactStatus
  inbox: boolean

  updateStatus(setSeen = false) {
    const ts: number = Math.round(Date.now() / 1000)

    if (this.status == EContactStatus.NewFavouriteContact) {
      this.status = EContactStatus.NewFavouriteContact
    } else {
      this.status = EContactStatus.Normal
    }
    if (setSeen) {
      this.seen = true
      this.status = EContactStatus.Normal
    }

    let timeout = 120
    if (this.state && this.state.payable) {
      timeout = 50
    }

    if (!this.seen && this.history.messages.length) {
      const last = this.history.messages[this.history.messages.length - 1]
      if (last.inbox && last.timestamp) {
        if ((ts - last.timestamp) > timeout) {
          this.status = EContactStatus.HasForgottenMessages
        } else {
          this.status = EContactStatus.HasUnreadMessages
        }
      } else {
        this.status = EContactStatus.Normal
      }
    }
  }
}

export interface IMailerTemplate {
  id: number,
  name: string,
  mailerMessage1: string,
  mailerMessage2: string,
  mailerMessage3: string,
  message1: string,
  message2: string,
  message3: string,
  message4: string,
  message5: string,
  message6: string,
  message7: string,
  message8: string,
  message9: string,
  message10: string,
  svadbaBoredMessage: string,
  svadbaFlirtyMessage: string,
  svadbaFriendlyMessage: string,
  svadbaMessage: string,
  svadbaNaughtyMessage: string,
  svadbaRomanticMessage: string
}

// Metric
export interface IMetricEvent {
  type: string
  timestamp: number
  payload: object | null
}

export class TMetricEvent extends TObject implements IMetricEvent {
  constructor(data: IMetricEvent) {
    super(data)
  }

  id: number
  type: string
  timestamp: number
  payload: object | null
}

export interface IMetricAnswerTime {
  diff: number
}

export interface IMetricLongAnswer {
  diff: number
}

export interface IMetricStopWords {
  words: string[]
}

export interface IStoreWS {
  chats: TChat[]
  user: null | IUser
  stat: { activeMailers: number } | null
  operator: null | IUser
  loading: { profiles: boolean, states: boolean }
  state: {
    started: boolean,
    workedTime: number,
    operatorId: string,
    unanswered: number
  } | any
  media: any
  components: {
    presentsPanel: [],
    mailerPanel: {
      loading: boolean,
      state: {
        [key: number]: {
          account: IAccount | null,
          templates: IMailerTemplate[]
        }
      }
    }
    afterChatTextPanel: {
      templates: IAfterChatText[],
      current: IAfterChatText,
      account: IAccount | null,
      client: IClient | null,
      messagesCount: 0 | any
    },
    timeTicker: {
      time: 0
    }
  },
}

declare module 'vue/types/vue' {
  export interface Vue {
    $ws: any
  }
}
