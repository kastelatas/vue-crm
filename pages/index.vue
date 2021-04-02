<template>
  <div v-if="!$route.query.key">Error: auth key must be defined</div>
  <section v-else class="chatting-page" :class="$route.params.mode === 'wink' ? 'wink' : ''">
    <Draggable
      v-model="chats"
      :move="handleMove"
      class="chatting-row"
      :style="{
        'height': chatHeight ? 'auto' : 'auto'
      }"
      :delay="200"
      :delay-on-touch-only="true"
      :options="{handle:'.chat-current-user'}"
      @end="handleDragEnd"
    >
      <!--     <div class="chatting-block">-->

      <Chat
        v-if="$ws.store"
        v-for="chat in chats" :key="$uuid.v4()"
        :chat="chat" :ws="$ws.socket" :mws="mws" :sync="sync" :user="$ws.store.user" :operator="$ws.store.operator"
        @close="close"
        @clear="clear"
        @selectChat="selectChat"
        @showAccountPanel="showAccountPanel"
        @openChatMedia="openChatMedia"
        @coordinates="coordinates"
        @openPicture="openPicture"
        :selected="select_chat === chat.account.extraId"
      />
      <!--     </div>-->
      <!-- @accountPanelShow="panelShow" -->
    </Draggable>
    <div v-if="user" class="right-sidebar it-has-a-tooltip">
      <div class="right-sidebar__content">
        <div v-if="state.unanswered" class="right-sidebar-btn-top">
<!--          <button style="margin:auto" type="button" class="btn btn-sm btn-danger" @click="scrollToUnanswered">-->
<!--            Not answered: {{ state.unanswered }}-->
<!--          </button>-->
        </div>
        <div v-if="operator" class="operator">
          {{ operator.name }}
        </div>
        <div class="right-sidebar-btn-top">
          <button
            type="button"
            class="btn-submit"
            :class="state.started ? 'btn-orange' : ''"
            @click="startStop"
            v-text="state.started ? 'Stop' : 'Start'"
          >
          </button>
          <input
            v-model="state.operatorId"
            :disabled="state.started"
            type="text" class="form-control"
            placeholder="Enter your ID"
          />
        </div>
        <div class="mailer-total-panel">
        <span class="mailer-total-panel-text">Worked time:
          <template v-if="state.started">
            <TimeTicker :time="state.workedTime"/>
          </template>
        </span>
          <span class="mailer-total-panel-text">Mailers launched:
          <span class="mailer-total-panel-text-mark">{{ stat ? stat.activeMailers : '' }} / {{ chats.length }}</span>
        </span>
          <!--        <div class="mailer-total-panel-wrapper">-->
          <!--          <button type="button" class="btn-submit  btn-orange-border">Stop all</button>-->
          <!--          <button type="button" class="btn-submit btn-orange">Start all</button>-->
          <!--        </div>-->
        </div>
        <!--        <template v-if="panel.action === 'search'">-->
        <!--          <HistoryPanel :account="panel.account" :contact="panel.contact" @close="panelHide"/>-->
        <!--        </template>-->
        <template v-if="panel.action === 'account'">
          <AccountPanel :account="panel.account" :user="user" @close="panelHide"/>
        </template>
        <template v-else>
          <PresentsPanel :state="components.presentsPanel"></PresentsPanel>
          <template v-for="item in components.mailerPanel.state">
            <MailerPanel
              v-show="item.templates.length"
              :account="item.account" :user="user"
              :templates="item.templates"
              @saved="mailerTemplateSaved"
            ></MailerPanel>
          </template>
          <AfterChatTextsPanel :state="components.afterChatTextPanel" @saved="loadAfterChatTemplate"/>
        </template>
        <div class="mode-link">
          <a :href="modeLink()">Go to {{ modeLinkTitle() }} mode</a>
        </div>
        <!--        <div class="change-theme col-12">-->
        <!--          <div class="form-group">-->
        <!--            <select ref="theme" v-model="state.theme" class="form-control-sm" @change="changeTheme">-->
        <!--              <option value="light">Light theme</option>-->
        <!--              <option value="dark">Dark theme</option>-->
        <!--            </select>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--      <div class="advertising">-->
        <!--        <h3>Внимание!</h3>-->
        <!--        <h4>Необходимо запустить рассылку</h4>-->
        <!--        <button type="button" class="btn-orange">Запустить</button>-->
        <!--        <span class="icon-close-dialog"></span>-->
        <!--      </div>-->
        <!--      <div class="message-popup">-->
        <!--        <h5>Ник отправителя</h5>-->
        <!--        <p>Текст сообщения от менеджера,-->
        <!--          отправленный юзеру.</p>-->
        <!--        <span class="time-date-message">16.11.2019 16:05:19</span>-->
        <!--        <span class="icon-close-dialog"></span>-->
        <!--      </div>-->
      </div>
    </div>

    <StickerModal/>
    <PhotoModal/>
    <VideoModal/>
    <div style="
     position:absolute;
    z-index: 200;
    left:50%;
    top: 50%;
    width: 365px;
    height: 526px;
    transform: translate(-50%, -50%);"
         v-if="accountChat">
      <vue-draggable-resizable
        :w="365" :h="526"
        :min-height="526"
        :min-width="365"

        @dragging="onDrag"
        @onResize="onResize"
        @resize="onResize"
        :drag-handle="'.drag-handle'"
        class-name="my-class"
      >
        <AboutUser :accountChat="profileData" @hideModal="hideModal" @showPhotosLightbox="showPhotosLightbox"/>
      </vue-draggable-resizable>
    </div>
    <template v-if="panel.action === 'search'">
      <div style="
    position:absolute;
    z-index: 200;
    left:50%;
    top: 50%;
    width: 365px;
    height: 526px;
    transform: translate(-50%, -50%);"
      >
        <vue-draggable-resizable
          :w="365" :h="526"
          :min-height="526"
          :min-width="365"

          @dragging="onDrag"
          @onResize="onResize"
          @resize="onResize"
          :drag-handle="'.drag-handle'"
        >
          <ChatHistory :account="panel.account" :contact="panel.contact" @close="closeHistoryModal"/>
        </vue-draggable-resizable>
      </div>
    </template>
    <template v-if="profileData">
      <light-box ref="lightbox" :media="photosLightboxData()" :show-light-box="false" v-if="profileData.photos.length"/>
    </template>
<!--    <template v-if="chatHistoryMedia">-->
<!--      <light-box ref="lightboxMedia" :media="historyMediaLightbox()" :show-light-box="false"/>-->
<!--    </template>-->
    <template v-if="imgSrc">
      <ShowPictureModal :img="imgSrc" @close="closeModal"/>
    </template>
  </section>
</template>

<script lang="ts">
import Vue, { VNode } from 'vue'
import Draggable from 'vuedraggable'
import Chat from '~/components/Chat.vue'
import AboutUser from '~/components/modals/AboutUserModal.vue'
import ChatHistory from '~/components/modals/ChatHistoryModal.vue'
import 'vue-image-lightbox/dist/vue-image-lightbox.min.css'


import {
  arr,
  EContactStatus,
  IAccount,
  IMediaPhoto,
  IAfterChatText,
  IChatAccount,
  IClient,
  IClientProfile,
  IClientState,
  IContact,
  IFavorite,
  IIdent,
  IMailerTemplate,
  IMessage,
  IPresent,
  IUser,
  TChat
} from '~/types/core'
import StickerModal from '~/components/modals/StickerModal.vue'
import PhotoModal from '~/components/modals/PhotoModal.vue'
import VideoModal from '~/components/modals/VideoModal.vue'
import HistoryPanel from '~/components/panels/HistoryPanel.vue'
import AccountPanel from '~/components/panels/AccountPanel.vue'
import PresentsPanel from '~/components/panels/PresentsPanel.vue'
import AfterChatTextsPanel from '~/components/panels/AfterChatTextsPanel.vue'
import MailerPanel from '~/components/panels/MailerPanel.vue'
import TimeTicker from '~/components/TimeTicker.vue'
import {uuid as $uuid} from 'vue-uuid';
import ShowPictureModal from "~/components/modals/ShowPictureModal.vue";

Vue.prototype.$uuid = $uuid;


interface IData {
  user: IUser | null,
  operator: IUser | null,
  startWorkTimestamp: number,
  chats: TChat[],
  stat: {
    activeMailers: number
  },

}

export default Vue.extend({
  components: {
    Draggable,
    Chat,
    StickerModal,
    PhotoModal,
    VideoModal,
    AccountPanel,
    HistoryPanel,
    PresentsPanel,
    AfterChatTextsPanel,
    MailerPanel,
    AboutUser,
    TimeTicker,
    ChatHistory,
    ShowPictureModal
  },
  data() {
    return {
      chatHeight: false as boolean,
      sync: 0, // metric timestamp sync
      chats: [] as TChat[],
      user: null as IUser | null,
      stat: null as { activeMailers: number } | null,
      operator: null as IUser | null,
      ws: null as WebSocket | null,
      mws: null as WebSocket | null,
      loading: {profiles: false, states: false},
      select_chat: 0,
      media: {message: new Audio('/media/message.mp3')},
      state: {
        theme: localStorage.getItem('theme') || 'light',
        started: false,
        workedTime: 0,
        operatorId: '',
        unanswered: 0
      },
      panel: {
        action: null as string | null,
        account: null as IChatAccount | null,
        contact: null as IContact | null
      },
      drag: {
        futureItem: null as TChat | null,
        movingItem: null as TChat | null,
        futureIndex: null as number | null,
        movingIndex: null as number | null
      },
      components: {
        presentsPanel: [],
        mailerPanel: {
          loading: false,
          state: [] as {
            [key: number]: {
              account: IAccount | null,
              templates: IMailerTemplate[]
            }
          }
        },
        afterChatTextPanel: {
          templates: [] as IAfterChatText[],
          current: {} as IAfterChatText,
          account: null as IAccount | null,
          client: null as IClient | null,
          messagesCount: 0
        },
        timeTicker: {
          time: 0
        }
      },
      resizing: false,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      accountChat: null as IAccount | null,
      profileData: null as IAccount | null,
      draggingId: null,
      prevOffsetX: 0,
      prevOffsetY: 0,
      chatHistoryMedia:[] as any,
      imgSrc: ''

    }
  },

  created(): void {
    this.body().setAttribute('class', this.state.theme)
    // this.connect()

    setTimeout(()=> {
      this.chats = this.$ws.store.chats
    }, 800)

    setInterval(() => {
      this.$ws.loadProfiles()
      this.$ws.loadStates()
    }, 1000)

    setInterval(() => {
      this.$ws.fillProfileQueues()
    }, 5000)

    // setInterval(() => {
    //   this.loadAfterChatTemplate()
    // }, 10000)
    //
    // setInterval(() => {
    //   this.loadMailerTemplates()
    // }, 10000)
    //
    setInterval(() => {
      this.$ws.loadCountActiveMailers()
    }, 10000)
  },
  watch:{
    'chats'(){
     if (this.chats) {
       if (window.innerWidth < 1921 && window.innerWidth > 1760 ) {
         if (this.chats.length >= 6) {
           this.chatHeight = true
         }
       }
       if (window.innerWidth < 1760 && window.innerWidth > 1440 ) {
         if (this.chats.length >= 5) {
           this.chatHeight = true
         }
       }
       if (window.innerWidth < 1370 && window.innerWidth > 1223 ) {
         if (this.chats.length >= 4) {
           this.chatHeight = true
         }
       }
     }
    },
    'window'(){
      console.log(window.location.pathname)
    }
  },
  mounted() {
    if (window.innerWidth < 1921 && window.innerWidth > 1760 ) {
      if (this.chats.length >= 6) {
        this.chatHeight = true
      }
    }

  },
  computed:{
      storeChats(): any{
        setTimeout(()=>{
          console.log(this.$ws.store.chats)
          return this.$ws.store.chats
        }, 800)
      }
  },
  methods: {
    closeModal() {
      this.imgSrc = '';
    },
    openPicture(message, type) {
      let result = message && message?.text.replace(
        'events/chat-image-updated?',
        'events/chat-image-updated?token=' + this.$route.query.key + '&'
      )
      if (result.includes('img') ) {
        console.log( result.slice(10, result.length - 4))
        if (type == 'D'){
          this.imgSrc = result.slice(10, result.length - 4)
        } else {
          this.imgSrc = result.slice(29, result.length - 4)
        }


      }
    },
    showPhotosLightbox(index) {
      this.$refs.lightbox['showImage'](index);
    },
    openChatMedia(media){
      // this.chatHistoryMedia.push(media) as any
      // this.$refs.lightboxMedia['showImage'](0);
    },
    photosLightboxData() {
      const mediaPhoto = [] as any;
      if (this.profileData?.photos?.length as any) {
        for (const photo of this.profileData && this.profileData?.photos as any) {
          mediaPhoto.push({
            src: photo,
            thumb: photo
          });
        }
        return mediaPhoto && mediaPhoto.length ? mediaPhoto : null;
      }
    },
   // historyMediaLightbox() {
   //    const mediaPhoto = [] as any;
   //    if ( this.chatHistoryMedia.length as any) {
   //      for (const item of this.chatHistoryMedia) {
   //        mediaPhoto.push({
   //          src: item,
   //          thumb: item
   //        });
   //      }
   //      return mediaPhoto && mediaPhoto.length ? mediaPhoto : null;
   //    }
   //  },
    coordinates(payload){
      this.x = payload.x;
      this.y = payload.y;
    },
    hideModal() {
      this.accountChat = null
    },
    async profilesData(account) {
      this.profileData = null;
      let user = '';
      let apiInfo = '';
      if (account[0].type == 'ambassador') {
        user = `&girl_site_id=${account[0].account.id}&topdates_type=${account[0].account.type} `;
        apiInfo = '/api/get-girl-profile-info/';
        await this.fetchInfoUser(apiInfo, user);
      } else {
        user = `&man_site_id=${account[0].account.id}&topdates_type=${account[0].accType}&girl_site_id=${account[0].chatAmbassadorId} `;
        apiInfo = '/api/get-man-profile-info/';
        await this.fetchInfoUser(apiInfo, user);
      }
    },
    async fetchInfoUser(apiInfo, user) {
      await fetch('http://'
        + '777wt.net'
        + apiInfo
        + '?access_token=2h4_ZWu0thjwa3EycvCWmURt'
        + `&token=${this.$route.query.key}`
        + user)
        .then(result => result.json())
        .then((result) => {
          this.profileData = result;
        }).catch((e) => {
          console.log(e)
        })
    },

    showAccountPanel(account) {
      this.accountChat = null
      this.accountChat = account
      this.profilesData(account);
    },
    onResize(x, y, width, height) {
      console.log(x, y, width, height)
      this.resizing = true
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      console.log(height, width)
    },
    onDrag(x, y) {
      this.x = x
      this.y = y
    },
    selectChat(id) {
      this.select_chat = id;
    },
    body() {
      return document.body
    },
    modeLink() {
      if (this.$route.params.mode == 'wink') {
        return location.href.replace('/wink', '/')
      } else {
        return location.href.replace(location.host + '/', location.host + '/wink')
      }
    },
    modeLinkTitle() {
      return this.$route.params.mode == 'wink' ? 'normal' : 'wink'
    },
    close(chat: TChat) {
      chat.selectedContact = null
      chat.contacts = []
    },
    closeHistoryModal() {
      this.panel = {} as any
    },
    clear(chat: TChat) {
      chat.contacts = chat.selectedContact ? [chat.selectedContact!] : [];
    },
    // connect() {
    //   if (this.ws) {
    //     return
    //   }
    //   this.ws = new WebSocket('ws://' + (process.env.API_HOST || location.hostname + ':7777') + '/ws/' + this.$route.query.key)
    //   this.ws.onclose = () => {
    //     this.ws = null
    //   }
    //   this.ws.onmessage = (evt: MessageEvent) => {
    //     const data = JSON.parse(evt.data)
    //     switch (data.type) {
    //       case 'init':
    //         this.initHandler(data.payload)
    //         // this.metricConnect()
    //         this.loadAfterChatTemplate()
    //         this.loadMailerTemplates()
    //         break
    //       case 'message':
    //         this.messageHandler(data.ident, data.payload)
    //         break
    //       case 'favorite':
    //         this.favoriteHandler(data.ident, data.payload)
    //         break
    //       case 'hide-account':
    //         this.hideAccountHandler(data.payload)
    //         break
    //     }
    //   }
    //
    //   this.ws.onclose = (e) => {
    //     console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    //     this.ws = null
    //     setTimeout(() => {
    //       this.connect();
    //     }, 1000);
    //   };
    //   this.ws.onerror = function (evt) {
    //     console.error('Socket error observed:', evt)
    //   }
    // },
    // metricConnect() {
    //   if (this.mws) {
    //     return
    //   }
    //
    //   if (this.operator) {
    //     this.mws = new WebSocket('ws://' + (process.env.API_METRIC_HOST || location.hostname + ':8888') + '/ws-metric/' + this.operator!.id)
    //     this.mws.onclose = (e) => {
    //       console.log('Metric socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    //       this.mws = null
    //       setTimeout(() => {
    //         this.metricConnect();
    //       }, 1000);
    //     };
    //
    //     this.mws.onmessage = (evt: MessageEvent) => {
    //       const data = JSON.parse(evt.data)
    //       switch (data.type) {
    //         case 'init':
    //           this.metricInitHandler(data.timestamp)
    //           break
    //       }
    //     }
    //
    //     this.mws.onerror = function (evt) {
    //       console.error('Metric socket error observed:', evt)
    //     }
    //   }
    // },
    // getChat(accountId: number, type: string): TChat | null {
    //   for (let i = 0; i < this.chats.length; i++) {
    //     const chat = this.chats[i]
    //     if (chat.account.id == accountId && chat.account.type == type) {
    //       return chat
    //     }
    //   }
    //   return null
    // },
    // loadMailerTemplates() {
    //   if (this.components.mailerPanel.loading) {
    //     return
    //   }
    //
    //   interface IResponse {
    //     [index: number]: {
    //       account: IAccount,
    //       templates: IMailerTemplate[],
    //     }
    //   }
    //
    //   const params = {userId: this.user!.id, pass: [] as number[]}
    //   for (const i in this.components.mailerPanel.state) {
    //     const item = this.components.mailerPanel.state[i]
    //     params.pass.push(item.account!.id)
    //   }
    //
    //   this.components.mailerPanel.loading = true
    //   fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/mailer-not-running-templates/' + JSON.stringify(params))
    //     .then((response: Body) => response.json())
    //     .then((result: IResponse) => {
    //       this.components.mailerPanel.loading = false
    //       if (result) {
    //         for (const i in result) {
    //           const state: any = this.components.mailerPanel.state
    //           state.push(result[i])
    //         }
    //       }
    //     })
    // },
    // loadCountActiveMailers() {
    //   interface IResponse {
    //     countActiveMailers: number,
    //   }
    //
    //   const params = {userId: this.user!.id}
    //
    //   fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/count-active-mailers/' + JSON.stringify(params))
    //     .then((response: Body) => response.json())
    //     .then((result: IResponse) => {
    //       if (result) {
    //         this.stat!.activeMailers = result.countActiveMailers
    //       }
    //     })
    // },
    mailerTemplateSaved(girlSiteId: number, type: string) {
      const state = this.components.mailerPanel.state
      for (const i in state) {
        const item = state[i]
        if (item.account!.id == girlSiteId && item.account!.type == type) {
          // this.stat!.activeMailers++
          (state as []).splice(Number(i), 1)
        }
      }
    },
    // loadAfterChatTemplate() {
    //   if (this.components.afterChatTextPanel.account) {
    //     return;
    //   }
    //
    //   interface ITemplate {
    //     id: number | null
    //     subject: string
    //     text: string
    //   }
    //
    //   interface IResponse {
    //     account: IAccount,
    //     client: IClient,
    //     templates: ITemplate[],
    //     current: ITemplate | null,
    //     messagesCount: number
    //   }
    //
    //   const params = {userId: this.user!.id}
    //   fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/after-chat-text/' + JSON.stringify(params))
    //     .then((response: Body) => response.json())
    //     .then((result: IResponse) => {
    //       const state = this.components.afterChatTextPanel;
    //       if (result) {
    //         state.account = result.account
    //         state.client = result.client
    //         state.templates = result.templates
    //         state.messagesCount = result.messagesCount
    //         if (result.current) {
    //           state.current = result.current
    //         } else {
    //           state.current = {id: null, subject: '', text: ''}
    //         }
    //       } else {
    //         state.templates = []
    //         state.current = {id: null, subject: '', text: ''}
    //         state.account = null
    //         state.client = null
    //       }
    //     });
    // },
    // initHandler(payload: IData) {
    //   if (payload.chats) {
    //     this.chats = []
    //     this.user = payload.user
    //     this.stat = payload.stat;
    //     for (let i = 0; i < payload.chats.length; i++) {
    //       this.chats.push(new TChat(payload.chats[i]))
    //     }
    //     this.chats = this.chats.sort((a: TChat, b: TChat) => {
    //       return b.lastTimestamp() - a.lastTimestamp()
    //     })
    //   }
    //
    //   if (payload.operator) {
    //     this.operator = payload.operator
    //     this.state.operatorId = String(payload.operator.id)
    //     this.state.started = true
    //     this.state.workedTime = payload.startWorkTimestamp
    //   }
    //
    //   this.recalculateUnanswered()
    // },
    metricInitHandler(ts: number) {
      this.sync = Math.round(Date.now() / 1000) - ts
    },
    // messageHandler(ident: IIdent, payload: IMessage) {
    //   const chat = this.getChat(ident.girlSiteId, ident.type)
    //   if (chat) {
    //     if (!payload.wink || chat.account.favorites.includes(payload.manId) || this.$route.params.mode == 'wink') {
    //       if (payload.inbox) {
    //         this.media.message.play()
    //       }
    //
    //       if (payload.inbox && chat.contacts.length == 0) {
    //         if (chat.contacts.length == 0) {
    //           this.chats.push(this.chats.splice(this.chats.indexOf(chat), 1)[0]);
    //         }
    //       }
    //       chat.addMessage(payload)
    //
    //       if (payload.present) {
    //         const present = {
    //           message: payload,
    //           type: ident.type,
    //           accountId: ident.girlSiteId,
    //           clientId: payload.manId
    //         }
    //         // @ts-ignore
    //         this.components.presentsPanel.push(present)
    //       }
    //       this.recalculateUnanswered()
    //     }
    //   }
    // },
    // favoriteHandler(ident: IIdent, payload: IFavorite) {
    //   const chat = this.getChat(ident.girlSiteId, ident.type)
    //   if (chat) {
    //     for (const i in chat.contacts) {
    //       const contact = chat.contacts[i]
    //       if (contact.id == payload.manId) {
    //         contact.state.favorite = payload.state
    //       }
    //     }
    //
    //     if (payload.state) {
    //       chat.account.favorites.push(payload.manId)
    //     } else {
    //       arr.remove(chat.account.favorites, payload.manId)
    //     }
    //   }
    // },
    // hideAccountHandler(id: number) {
    //   for (let i = 0; i < this.chats.length; i++) {
    //     if (this.chats[i].account.id == id) {
    //       this.chats.splice(i, 1)
    //     }
    //   }
    // },
    // recalculateUnanswered() {
    //   let result = 0
    //   for (const i in this.chats) {
    //     for (const j in this.chats[i]?.contacts) {
    //       if (this.chats[i].contacts[j].status !== EContactStatus.Normal) {
    //         result++
    //       }
    //     }
    //   }
    //   this.state.unanswered = result
    // },

    handleDragEnd() {
      this.drag.futureItem = this.chats[this.drag.futureIndex!]
      this.drag.movingItem = this.chats[this.drag.movingIndex!]
      const _items: TChat[] = Object.assign([], this.chats)
      _items[this.drag.futureIndex!] = this.drag.movingItem
      _items[this.drag.movingIndex!] = this.drag.futureItem
      this.chats = _items
    },

    handleMove(e: any) {
      const {index, futureIndex} = e.draggedContext
      this.drag.movingIndex = index
      this.drag.futureIndex = futureIndex
      return false
    },
    // scrollToUnanswered() {
    //   for (const i in this.chats) {
    //     for (const j in this.chats[i].contacts) {
    //       if (this.chats[i].contacts[j].status !== EContactStatus.Normal) {
    //         document.getElementById('chat-' + this.chats[i].account.id + this.chats[i].account.type)!.scrollIntoView()
    //         return
    //       }
    //     }
    //   }
    // },
    // startStop() {
    //   const params = {} as {
    //     operatorId: number,
    //     earnOperatorId: number,
    //   }
    //
    //   interface IResponse {
    //     startTime: number,
    //   }
    //
    //   params.operatorId = this.user!.id
    //   params.earnOperatorId = parseInt(this.state.operatorId)
    //
    //   if (!this.state.started) {
    //     if (!this.state.operatorId) {
    //       alert('Enter the ID of the operator')
    //     } else if (!parseInt(this.state.operatorId)) {
    //       alert('Error entering ID')
    //     } else {
    //       fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/user/' + parseInt(this.state.operatorId))
    //         .then((response: Body) => response.json())
    //         .then((operator: IUser) => {
    //           if (!operator) {
    //             return
    //           }
    //           if (confirm('Operator ' + operator.name + ' (id: ' + operator.id + ').\nStart?')) {
    //             fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/chat/start/' + JSON.stringify(params))
    //               .then((response: Body) => response.json())
    //               .then((result: IResponse) => {
    //                 if (result) {
    //                   this.state.workedTime = result.startTime
    //                 } else {
    //                   this.state.workedTime = Math.floor(Date.now() / 1000)
    //                 }
    //                 this.operator = operator
    //                 this.state.started = true
    //               })
    //           }
    //         })
    //     }
    //   } else {
    //     fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/chat/stop/' + JSON.stringify(params))
    //       .then((response: Body) => response.json())
    //       .then(() => {
    //         this.state.started = false
    //         this.operator = null
    //       })
    //   }
    // },
    // panelShow(data: any) {
    //   this.panel = data
    // },
    // panelHide(){
    //   this.panel = {
    //     action: '',
    //     account: null,
    //     contact: null
    //   }
    // },

    // fillProfileQueues() {
    //   for (const i in this.chats) {
    //     const chat = this.chats[i]
    //     for (const j in chat?.contacts) {
    //       const contact = chat.contacts[j]
    //       if (!contact?.profile) {
    //         chat.profileQueue.push(contact.id)
    //       }
    //     }
    //   }
    // },
    // loadProfiles() {
    //   interface IParams {
    //     userId: number,
    //     payload: { [key: string]: number[] }
    //   }
    //
    //   interface IResponse {
    //     [key: string]: {
    //       [key: number]: IClientProfile
    //     }
    //   }
    //
    //   if (this.user && !this.loading.profiles) {
    //     this.loading.profiles = true
    //     const params: IParams = {
    //       userId: this.user.id,
    //       payload: {}
    //     }
    //
    //     for (const i in this.chats) {
    //       const chat = this.chats[i]
    //       if (chat?.profileQueue.length) {
    //         const key = chat.account.id + '_' + chat.account.type
    //         if (!params.payload[key]) {
    //           params.payload[key] = []
    //         }
    //         Array.prototype.push.apply(params.payload[key], chat.profileQueue)
    //         chat.profileQueue = []
    //       }
    //     }
    //
    //     if (!Object.keys(params.payload).length) {
    //       this.loading.profiles = false
    //       return
    //     }
    //
    //     for (const key in params.payload) {
    //       params.payload[key] = arr.unique(params.payload[key])
    //     }
    //
    //     fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/contact-profiles/' + JSON.stringify(params))
    //       .then((response: Body) => response.json())
    //       .then((result: IResponse) => {
    //         this.loading.profiles = false
    //         for (const ident in result) {
    //           const [accountId, type] = ident.split('_')
    //           const chat = this.getChat(Number(accountId), type)
    //           if (chat) {
    //             const profiles = result[ident]
    //             for (const clientId in profiles) {
    //               const profile = profiles[clientId]
    //               for (const i in chat.contacts) {
    //                 if (chat.contacts[i].id == Number(clientId)) {
    //                   chat.contacts[i].profile = profile
    //                   break
    //                 }
    //               }
    //             }
    //             chat.contacts = [...chat.contacts]
    //           }
    //         }
    //       })
    //   }
    // },
    // loadStates() {
    //   interface IParams {
    //     userId: number,
    //     payload: { [key: string]: number[] }
    //   }
    //
    //   interface IResponse {
    //     [key: string]: {
    //       [key: number]: IClientState
    //     }
    //   }
    //
    //   if (this.user && !this.loading.states) {
    //     this.loading.states = true
    //     const params: IParams = {
    //       userId: this.user.id,
    //       payload: {}
    //     }
    //
    //     for (const i in this.chats) {
    //       const chat = this.chats[i]
    //       if (chat?.stateQueue.length) {
    //         const key = chat.account.id + '_' + chat.account.type
    //         if (!params.payload[key]) {
    //           params.payload[key] = []
    //         }
    //         Array.prototype.push.apply(params.payload[key], chat.stateQueue)
    //         chat.stateQueue = []
    //       }
    //     }
    //
    //     if (!Object.keys(params.payload).length) {
    //       this.loading.states = false
    //       return
    //     }
    //
    //     for (const key in params.payload) {
    //       params.payload[key] = arr.unique(params.payload[key])
    //     }
    //
    //     fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/contact-states/' + JSON.stringify(params))
    //       .then((response: Body) => response.json())
    //       .then((result: IResponse) => {
    //         this.loading.states = false
    //         for (const ident in result) {
    //           const [accountId, type] = ident.split('_')
    //           const chat = this.getChat(Number(accountId), type)
    //           if (chat) {
    //             const states = result[ident]
    //             for (const clientId in states) {
    //               const state = states[clientId]
    //               for (const i in chat.contacts) {
    //                 if (chat.contacts[i].id == Number(clientId)) {
    //                   chat.contacts[i].state = state
    //                   break
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       })
    //   }
    // },
  }
})
</script>

<style scoped lang="scss">
.right-sidebar {

  .mailer-total-panel {
    display: flex;
    flex-flow: column;
    border-radius: 10px;
    box-shadow: 4px 0 21px 0 #f0f0f0;
    background-color: #ffffff;
    padding: 18px 20px 20px 20px;
    margin: 13px 11px 13px 11px;
    text-align: center;

    &-wrapper {
      display: flex;
      flex-flow: column;

      .btn-submit + .btn-submit {
        margin-top: 4px;
      }
    }

    &-text {
      font-size: 14px;
      font-weight: 500;
      font-family: 'Geometria-Bold';
      color: #b3b6bf;
      padding-bottom: 16px;

      &-mark {
        color: #4a4a4a;
      }
    }
  }

  .mode-link {
    text-align: center;
    margin-top: 10px;
  }

  .change-theme {
    padding-top: 15px;
    padding-bottom: 15px;
    text-align: center;
  }
}

//.my-class {
//  left: 700px;
//  position: relative;
//}
</style>
