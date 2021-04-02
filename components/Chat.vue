<template>
  <div v-if="chat.contacts.length" :id="'chat-' + chat.account.id + chat.account.type" class="chat-box"
       :class="{
         'selected-chat': selected,
         'noselected-chat': !selected,
       }"
       @click="selectChat(chat.account.extraId)"
       ref="chat_box"
  >
    <div class="chat-users-list" @scroll="scrollUserList" ref="usersList">
      <div
        v-for="contact in contacts"
        :key="contact.id + '_' + chat.account.id"
        class="chat-user-box-one no-select"
        :class="getContactClass(contact)"
        @click="contactListClick(contact, chat.account.id)"

      >
        <!--        @click="chat.selectContact(contact); insertChatText; saveChatText(chat.account.id); searchFilledInput(contact.id)"-->

        <div class="chat-user-box-one-img">

          <img v-if="contact.state && contact.state.blocked" src="/img/blocked.png" alt=""
               title="This is man from black list, please finish this chat quickly"/>
          <img v-else-if="contact.profile && contact.profile.avatar" :src="contact.profile.avatar" alt=""
          />
          <img v-else src="/img/no-avatar.png" alt=""/>
          <span v-if="contact.profile && contact.profile.birthday" class="icon-user-gift">
             <inline-svg src="/img/gift.svg"/>
          </span>
          <span v-if="contact.state && contact.state.payable" class="icon-user-money">
             <inline-svg src="/img/dollar.svg"/>
          </span>
          <span v-if="contact.profile && contact.profile.vip" class="icon-user-vip">
            <inline-svg src="/img/diamond.svg"/>
          </span>

        </div>
        <h6 v-if="contact.profile && contact.profile.name" @dblclick="copyContact(contact)">
          {{ contact.profile.name }}
          <span class="client-id">{{ contact.id }}</span>
        </h6>

        <h6 v-else @click="copyContact(contact)">{{ contact.id }}</h6>
        <div class="capability">
          <span class="icon-text"
                v-tooltip.bottom-end="{content:'Открыть историю переписки', classes: 'icon-tooltip', delay:{show: 1500}}"
          >
<!--            @click.stop="historyPanelShow(contact)"-->
            <router-link
              :to="'/' + chat.account.type + '/' + chat.account.id + '/' + contact.id  + '/history' + '/' + $route.query.key"
              target="_blank">
              <inline-svg src="img/chat-histori.svg"/>
            </router-link>
          </span>
          <span class="icon-star"
                @click.stop="toggleFavorite(contact)">
            <inline-svg src="img/fav-star-1.svg" v-if="contact.state && contact.state.favorite"
                        v-tooltip.bottom-end="{content:'Добавить в Favlis', classes: 'icon-tooltip', delay:{show: 1500}}"
            />
            <inline-svg src="img/fav-star-2.svg" v-if="contact.state && !contact.state.favorite"
                        v-tooltip.bottom-end="{content:'Убрать  из Favlists', classes: 'icon-tooltip', delay:{show: 1500}}"
            />
          </span>
          <!--          <router-link  tag="a" target="_blank" class="icon-history" :to="'/' + chat.account.type + '/' + chat.account.id + '/' + contact.id  + '/history' + '/' + $route.query.key  ">-->
          <!--          </router-link>-->
        </div>
        <span class="icon-msg-count"
              @click="accountPanelShow($event,contact) "
              v-tooltip.bottom-end="{content:'Открыть профиль клиента', classes: 'icon-tooltip', delay:{show: 1500}}"
        >
         <inline-svg src="/img/list.svg"/>
        </span>
        <span class="chat-cop_id" @click="copyContact(contact)"
              v-tooltip.bottom-end="{content:'Скопировать данные о чате', classes: 'icon-tooltip', delay:{show: 1500}}"
        >
          <inline-svg src="./img/cop_id.svg"/>
        </span>
        <span class="icon-user-close" @click.right.prevent="chat.clearContacts(contact)"
              @click.stop="chat.removeContact(contact)">
          <inline-svg src="/img/close.svg"/>
        </span>
        <span class="hot-icon"></span>
      </div>
    </div>

    <div class="chat-window">
      <div class="chat-current-user" @mouseover.self="userTooltipFix">

        <div class="img">
         <span @mouseover="showUserInfo = true" @mouseleave="showUserInfo = false"
               @click="accountPanelShow($event,chat.account)">
           <img v-if="chat.account.avatar" :src="chat.account.avatar + '&token=' + $route.query.key" alt=""/>
           <img v-else src="/img/no-avatar.png" alt=""/>
         </span>
          <div class="user-info" :style="{'display': showUserInfo ? 'block' : 'none'} ">
            <!--            user-info-left-->

            <img v-if="chat.account.avatar" :src="chat.account.avatar + '&token=' + $route.query.key" alt=""
                 @click="redirect(chat.account)"/>
            <img v-else src="/img/no-avatar.png" alt=""/>
            <div class="user-content">
              <div><span class="label-info">Occupation:</span><span class="label-info-text">{{
                  chat.account.occupation
                }}</span>
              </div>
              <div><span class="label-info">City:</span><span class="label-info-text">{{ chat.account.city }}</span>
              </div>
              <div><span class="label-info">Age:</span><span
                class="label-info-text">{{ chat.account.birthdate }} <span
                style="color:#c0c3cc">({{ currentAge(chat.account.birthdate) }})</span></span></div>
              <div v-if="chat.account.comment"><span class="label-info">Comment:</span>
                <!--                <span class="label-info-text">{{ chat.account.comment | nl2br }}</span>-->
                <span class="label-info-text"
                      v-html="">{{ chat.account.comment.length > 300 ? chat.account.comment.slice(0, 300) + '...' : chat.account.comment }}</span>
              </div>
            </div>
          </div>
        </div>
        <h6>
          <span class="no-select" @dblclick="copyAccount(chat.account)"
                @mouseover="showUserInfo = true" @mouseleave="showUserInfo = false"
                @click="accountPanelShow($event, chat.account)"
          >{{ chat.account.name }}</span>
          <span class="chat-current-id no-select"
                @dblclick="copyAccount(chat.account)"
                @mouseover="showUserInfo = true" @mouseleave="showUserInfo = false"
                @click="accountPanelShow($event, chat.account)"
          >{{ chat.account.id }} {{ chat.account.type }}</span>
          <span class="chat-current-user-icon-star" @click="favoriteList"
                v-tooltip.bottom="{content:'Загрузить Favlist', classes: 'icon-tooltip', delay:{show: 1500}}">
            <inline-svg src="/img/load-fav-list.svg"/>
          </span>
          <span class="chat-current-user-cake" @click="birthdayList"
                v-tooltip.bottom="{content:'Загрузить сегодняшних клиентов - именинников', classes: 'icon-tooltip', delay:{show: 1500}}">
            <inline-svg src="/img/Birthdays.svg"/>
          </span>
        </h6>
        <span class="icon-close-dialog" @click.right.prevent="$emit('clear', chat)"
              @click="$emit('close', chat)">
          <inline-svg src="/img/close.svg"/>
        </span>
      </div>
      <div class="messages-dialog">
        <div ref="messagesList" class="messages-dialog_inner"
             :class="{'messages-dialog_inner-active': textareaMaxHeight}">
          <div v-for="message in chat.history().messages" class="messages-dialog">
            <div class="message-text"
                 :class="message.inbox ? 'messages-text_left' : 'messages-text_right'"
                 :style="{
                  'background' : message.wink && '#4a4a4a',
                  'box-shadow' : message.wink && 'inherit',
                  'border': message.wink && '1px solid #b9bcc7'
                 }"
            >

              <p v-html="compileMessage(message)" :style="{
                  'color' : message.wink && '#fff',
                  'cursor': message.text.includes('img') ? 'pointer' : 'auto'
                 }"
                 @click="$emit('openPicture', message, chat.account.type)"></p>
              <div class="time-date-message">
                <template v-if="message.timestamp">

                  <span v-if="!chat.history().isTodayMessage(message)">{{ message.timestamp | date }}</span>
                  <span>{{ message.timestamp | time }}</span>
                </template>
                <span v-else>Sending...</span>
                <!--                <span v-if="!message.inbox" class="mark">-->
                <!--                  <img v-if="message.messageId" src="/img/mark-double.png" alt=""/>-->
                <!--                  <img v-else src="/img/mark.png" alt=""/>-->
                <!--                </span>-->
              </div>
            </div>
          </div>
        </div>
        <div class="message-dialog-box">
          <span v-if="chat.account.hasPhotos" class="icon-photo"
                :style="{'top': chat.account.hasVideos ? '20px' : '28px'}" @click="photoModalShow"
                v-tooltip.bottom="{content:'Отправить фотографию в чат', classes: 'icon-tooltip', delay:{show: 1500} }"
          >
            <inline-svg src="./img/add-photo.svg"/>
          </span>
          <span v-if="chat.account.hasVideos" class="icon-video" @click="videoModalShow"
                v-tooltip.bottom="{content:'Отправить видео в чат', classes: 'icon-tooltip', delay:{show: 1500}}"
          >
            <inline-svg src="./img/add-video.svg"/>
          </span>
          <textarea
            ref="input" rows="1" type="text"
            placeholder="Enter the text..."
            class="chat-input"
            :class="{'chat-input__textarea-height': true}"
            @keydown.enter.exact.prevent
            @keydown.enter.exact="send"
            @input="autoresize"
            @focus="autoresize"
            @keydown="change, saveChatText($event, chat.account.id)"
            @keyup="change"
            @keypress="saveID(chat.account.id); "

          ></textarea>
          <span class="stickers-click" @click="stickerModalShow"
                v-tooltip.bottom="{content:'Отправить смайликат', classes: 'icon-tooltip', delay:{show: 1500}}"
          >
            <inline-svg src="./img/smile.svg"/>
          </span>
          <span class="message-chars-count">{{ messageText ? messageLength : '' }}</span>
        </div>
      </div>
    </div>

  </div>
</template>


<script lang="ts">
interface IPayload {
  selectedChatId: number,
  chatId: number,
  text: string
}

import Vue from 'vue'

import {
  EContactStatus,
  IContact,
  IFavorite,
  IIdent,
  IMessage,
  IMetricAnswerTime,
  IMetricLongAnswer,
  IMetricStopWords,
  IPhoto,
  ISendPhoto,
  ISendSticker,
  ISendVideo,
  IVideo,
  TChat,
  TContact,
  TEvent,
  TMetricEvent
} from '~/types/core'

let interval: number | any
export default Vue.extend({
  props: {
    ws: WebSocket,
    mws: WebSocket,
    sync: Number,
    chat: TChat,
    user: Object, // as IUser
    operator: Object, // as IUser
    selected: Boolean

  },
  components: {},
  data() {
    return {
      interval: null,
      ts: Math.round(Date.now() / 1000),
      controller: null as AbortController | null,
      messageText: '',
      chatID: 0,
      showUserInfo: false,
      textareaMaxHeight: false,
      userListScroll: 0,

    }
  },
  computed: {
    contacts(): TContact[] {
      return this.chat.contacts.sort(function (a, b) {
        return b.history.lastTimestamp() - a.history.lastTimestamp()
      })
    },
    messageLength(): number {
      const message = this.messageText.replace(/[\s]+/gis, '')
      return message.length
    },
    stopList() {
      return [ // TODO not detecting for dick word
        'dick', 'fuck', 'butts', 'shit', 'bitch', 'whattheheck', 'hell', 'ass', 'pussy',
        'octopussy', 'balls', 'screw', 'damn', 'asshole', 'prick', 'stoneball',
        'cunt', 'bullshit', 'suck', 'goddamn', 'cock', 'whore', 'slut', 'piss',
        'ratfuck', 'motherfucker', 'butt', 'dickhead', 'freak', 'jerk', 'Gay', 'Faggot',
        'fag', 'loser', 'sucker', 'nerd', 'dumd', 'retard', 'bastard', 'turd', 'condom',
        'virgin', 'nitwit', 'crap', 'genitals', 'adultfantasy', 'sex', 'naked', 'bedroom',
        'naughty', 'playful', 'hotter', 'dildo'
      ]
    }
  },
  created(): void {
    interval = setInterval(() => {
      for (const i in this.chat.contacts) {
        this.chat.contacts[i].updateStatus()
      }
    }, 1000)

    document.addEventListener('beforeunload', () => sessionStorage.setItem('setInputTexts', ''));
  },
  mounted(): void {


    this.scroll()
    this.chat.onMessage = (_contact: TContact, _message: IMessage) => {
      this.scroll()
    }
    this.chat.onContactSelect = (_contact: TContact) => {
      // this.$emit('recalculateUnanswered')
      this.$ws.recalculateUnanswered()
      this.scroll()
    }

    let chatID = localStorage.getItem('chatID') as any;
    let selectedContactID = localStorage.getItem('selectedChatId') as any;
    let chatMessage = localStorage.getItem('chatMessage');


    if (+chatID && +chatID == this.chat.account.id && +selectedContactID === this.chat.selectedContact?.id as any) {
      let input: HTMLInputElement = this.$refs.input as HTMLInputElement
      if (input !== undefined) {
        input.focus();
        if (chatMessage !== null) {
          input.value += chatMessage as any
        }
      }

      if (input.value.length) {
        input.style.height = 'auto';
        input.style.height = `${input.scrollHeight}px`;
      } else {
        input.style.height = 'inherit';
      }

    }


    // this.insertChatText();
    //
    //
    // if (this.selected) {
    //   const elInput: HTMLElement = this.$refs.input as HTMLElement
    //   setTimeout(() => {
    //     elInput.focus()
    //   })
    //
    //   if (elInput.clientHeight && elInput.clientHeight >= 73) {
    //     this.textareaMaxHeight = true
    //     this.scroll()
    //   } else {
    //     this.textareaMaxHeight = false
    //     this.scroll()
    //   }
    //   let usersListScroll = localStorage.getItem('usersListScroll');
    //   const elUserList: HTMLElement = this.$refs.usersList as HTMLElement
    //   if (usersListScroll) {
    //     elUserList.scrollTop = +usersListScroll
    //   }
    // }


  },
  destroyed(): void {
    clearInterval(interval)
  },
  methods: {

    scrollUserList(ev: Event) {
      const target: HTMLInputElement = ev.target as HTMLInputElement
      this.userListScroll = target.scrollTop
      localStorage.setItem('usersListScroll', target.scrollTop.toString())
    },
    saveID(id) {
      localStorage.setItem('selectedChatId', this.chat.selectedContact && this.chat.selectedContact.id as any)
      localStorage.setItem('chatID', id)


      // this.$store.dispatch('inputTexts', payload)
      // this.$store.commit('setInputTexts', payload)
    },
    saveChatText(e, id) {
      const payload = [
        {
          selectedChatId: this.chat.selectedContact && this.chat.selectedContact.id,
          chatId: id,
          text: e && e.target.value
        }
      ] as IPayload | any

      let chatsTexts = sessionStorage.getItem('setInputTexts');
      let exist = false;
      if (chatsTexts) {
        const parseTexts = JSON.parse(chatsTexts);
        parseTexts.forEach((item, index) => {
          if (item.selectedChatId == payload[0].selectedChatId) {
            item = payload[0]
            parseTexts[index] = item
            exist = true
          }
        })

        if (!exist) {
          parseTexts.push(payload[0])
        }

        sessionStorage.setItem('setInputTexts', JSON.stringify(parseTexts))
      } else {
        sessionStorage.setItem('setInputTexts', JSON.stringify(payload))
      }
    },
    contactListClick(contact, chatAccId) {

      this.searchFilledInput(contact.id)
      this.saveChatText(null, chatAccId);
      this.chat.selectContact(contact);
      this.insertChatText();
    },
    searchFilledInput(contactID) {
      // let input: HTMLInputElement = this.$refs.input as HTMLInputElement
      // if (input !== undefined) {
      //   input.value = '';
      // }
      //
      setTimeout(() => {
        let chatsTexts = sessionStorage.getItem('setInputTexts');
        let input: HTMLInputElement = this.$refs.input as HTMLInputElement
        if (chatsTexts) {
          let parseChats = JSON.parse(chatsTexts)
          parseChats.forEach(item => {
            if (item.selectedChatId == contactID) {
              if (input !== undefined) {
                input.value = item.text;
                this.messageText = item.text
              }
            } else {
              if (input !== undefined) {
                // input.value = '';
              }
            }
          })
        }
      })
    },
    insertChatText() {
      let chatsTexts = sessionStorage.getItem('setInputTexts');
      if (chatsTexts) {
        let parseChats = JSON.parse(chatsTexts)

        parseChats.forEach(item => {
          if (item.chatId == this.chat.account.id && item.selectedChatId == this.chat.selectedContact?.id as any) {
            let input: HTMLInputElement = this.$refs.input as HTMLInputElement
            if (input !== undefined) {
              input.focus();
              input.value = item.text as any
            } else {

            }
            if (input !== undefined) {
              if (input.value.length) {
                input.style.height = 'auto';
                input.style.height = `${input.scrollHeight}px`;
              } else {
                input.style.height = 'inherit';
              }
            }
          }
        })
      }
      // this.searchFilledInput(this.chat.selectedContact?.id)
    },
    currentAge(birthday) {
      let now = new Date();
      let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let dob = new Date(birthday);
      let dobnow = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      let age;

      age = today.getFullYear() - dob.getFullYear();
      if (today < dobnow) {
        age = age - 1;
      }
      return age
    },
    errorImg(src) {
      console.log('error', src)
    },
    selectChat(id) {
      setTimeout(() => {
        this.$emit('selectChat', id)
        const elChat: HTMLElement = this.$refs.chat_box as HTMLElement;
        const elInput: HTMLElement = this.$refs.input as HTMLElement
        // elInput.focus()
      })
    },

    compileMessage(message: IMessage) {
      let result = message.text.replace(
        'events/chat-image-updated?',
        'events/chat-image-updated?token=' + this.$route.query.key + '&'
      )

      if (message.letter) {
        result = '✉ ' + result + ' ✉'
      }
      return result
    },
    change(ev: Event) {
      const target: HTMLInputElement = ev.target as HTMLInputElement
      this.messageText = target.value;

      // if (target.clientHeight >= 58) {
      //   this.textareaMaxHeight = true
      //   // this.scroll()
      // } else {
      //   this.textareaMaxHeight = false
      //   // this.scroll()
      // }

      localStorage.setItem('chatMessage', this.messageText)
    },
    autoresize(ev: Event) {
      const target: HTMLInputElement = ev.target as HTMLInputElement
      if (target.value.length) {
        // target.style.height = 'auto';
        // target.style.height = '58px';
        target.style.height = `${target.scrollHeight}px`;
      } else {
        target.style.height = '58px';
      }
    },
    messageHasStopListWords(message: string): string[] {
      message = ' ' + message + ' '
      const result: string[] = []
      const re = new RegExp('([\\s]{1}|^)(' + this.stopList.join('|') + ')([\\s]{1}|$)', 'gis')
      const res = [...message.matchAll(re)]
      for (const ms of res) {
        result.push(ms[2])
      }
      return result
    },
    send(ev: KeyboardEvent) {
      sessionStorage.clear();

      if (this.chat.selectedContact) {
        const target: HTMLInputElement = ev.target as HTMLInputElement
        const value = target.value.trim()

        const history = this.chat.history()

        if (value.search(/[а-я]/gis) !== -1) {
          const ok = confirm('You are trying to send a message with Russian characters. Do you want to continue?')
          if (!ok) {
            return
          }
        }

        target.value = ''
        this.autoresize(ev)
        history.addMessage({
          manId: this.chat.selectedContact.id,
          type: this.chat.account.type,
          inbox: false,
          text: value
        } as IMessage)

        this.$ws.socket.send(JSON.stringify(
          new TEvent({
            type: 'message',
            ident: {
              userId: this.user.id,
              girlSiteId: this.chat.account.id,
              type: this.chat.account.type
            },
            payload: {
              manId: this.chat.selectedContact.id,
              inbox: false,
              text: value
            } as IMessage
          })
        ))

        // metric
        if (this.operator) {
          const ts = Math.round(Date.now() / 1000) + this.sync
          const words = this.messageHasStopListWords(value)
          if (words.length) {
            this.mws.send(JSON.stringify(
              new TMetricEvent({
                timestamp: ts,
                type: 'stop-words',
                payload: {words} as IMetricStopWords
              })
            ))
          }

          if (history.messages.length > 1) {
            const previous = history.messages[history.messages.length - 2]
            if (previous && previous.inbox && !previous.present) {
              const diff = ts - previous.timestamp
              if (diff < 1800) {
                this.mws.send(JSON.stringify(
                  new TMetricEvent({
                    timestamp: ts,
                    type: 'answer-time',
                    payload: {diff} as IMetricAnswerTime
                  })
                ))

                if (diff > 20) {
                  this.mws.send(JSON.stringify(
                    new TMetricEvent({
                      timestamp: ts,
                      type: 'long-answer',
                      payload: {diff} as IMetricLongAnswer
                    })
                  ))
                }
              }
            }
          }
        }
      }
      this.$ws.recalculateUnanswered()
    },
    scroll() {
      const el = this.$refs.messagesList as HTMLElement
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    },
    coppyId() {
      this.$store.dispatch('selectUser')
    },
    copyAccount() {
      const el = document.createElement('textarea');
      el.value = this.chat.account.name + ' ' + this.chat.account.id + ' ' + this.chat.account.type;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },
    copyContact(contact: IContact) {
      const el = document.createElement('textarea');
      el.value = this.chat.account.name.trim() + ' ' + this.chat.account.id + ' ' + this.chat.account.type +
        '\n/ ' + (contact.profile ? contact.profile.name + ' ' : '') + contact.id
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },
    redirect() {
      const url = 'http://777wt.net/girls/redirect?id=' + this.chat.account.extraId
      window.open(url, '_blank')!.focus()
    },
    toggleFavorite(contact: TContact) {
      let name = contact.id + this.chat.account.type
      if (contact.profile) {
        name = contact.profile.name + ' (' + name + ')'
      }

      let action = 'add to favorites'
      if (contact.state.favorite) {
        action = 'remove from favorites'
      }

      if (!confirm('Do you really want ' + action + '\n' + name + '?')) {
        return
      }

      contact.state.favorite = !contact.state.favorite
      this.ws.send(JSON.stringify(new TEvent({
        type: 'favorite',
        ident: {
          userId: this.user.id,
          girlSiteId: this.chat.account.id,
          type: this.chat.account.type
        },
        payload: {
          manId: contact.id,
          state: contact.state.favorite
        } as IFavorite
      })))
    },
    birthdayList() {
      if (!confirm('Are you sure you want to load people, who have birthday today, to contact list?')) {
        return
      }

      const params = {
        ident: {
          userId: this.user.id,
          girlSiteId: this.chat.account.id,
          type: this.chat.account.type
        } as IIdent
      }

      if (this.controller) {
        this.controller.abort()
        this.controller = null
      }

      this.controller = new AbortController()
      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/birthday-list/' + JSON.stringify(params), {
        signal: this.controller.signal
      }).then((response: Body) => response.json())
        .then((result: IContact[]) => {
          if (!result.length) {
            alert('No contacts who have birthday today');
            return;
          }
          for (const i in result) {
            this.chat.setContact(new TContact(result[i]), true)
          }
        })
    },
    favoriteList() {
      if (!confirm('Are you sure you want to load favorites to contact list?')) {
        return
      }

      const params = {
        ident: {
          userId: this.user.id,
          girlSiteId: this.chat.account.id,
          type: this.chat.account.type
        } as IIdent
      }

      if (this.controller) {
        this.controller.abort()
        this.controller = null
      }

      this.controller = new AbortController()
      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/favorite-list/' + JSON.stringify(params), {
        signal: this.controller.signal
      }).then((response: Body) => response.json())
        .then((result: IContact[]) => {
          if (!result.length) {
            alert('No favorite contacts available');
            return;
          }
          for (const i in result) {
            const contact = new TContact(result[i])
            contact.status = EContactStatus.NewFavouriteContact
            this.chat.setContact(contact, true)
          }
        })
    },
    openHistory(contact: TContact) {
      const url = '/' + this.chat.account.type + '/' + this.chat.account.id + '/' + contact.id + '/history'
      window.open(url, '_blank')!.focus()
    },
    coordinates(e) {

    },
    accountPanelShow(e, account) {
      let payload = [] as any;
      if (account && account.state == undefined) {
        payload = []
        payload.push({
          type: 'ambassador',
          account: account
        })
      } else {
        payload = []
        payload.push({
          type: 'user',
          account: account,
          accType: this.chat.account.type,
          chatAmbassadorId: this.chat.account.id
        })
      }

      this.$emit('showAccountPanel', payload)
      this.$emit('coordinates', {x: e.pageX, y: e.pageY})

      // this.$emit('accountPanelShow', {
      //   action: 'account',
      //   account: this.chat.account
      // })
    },
    historyPanelShow(contact: TContact) {
      this.$emit('historyPanelShow', {
        action: 'search',
        account: this.chat.account,
        contact
      })
    },
    stickerModalShow() {
      const manId = this.chat.selectedContact!.id
      this.$modal.show('chat-sticker-modal', {
        chat: this.chat,
        stickerSelected: (sticker: string) => {
          this.ws.send(JSON.stringify(new TEvent({
            type: 'send-sticker',
            ident: {
              userId: this.user.id,
              girlSiteId: this.chat.account.id,
              type: this.chat.account.type
            },
            payload: {sticker, manId} as ISendSticker
          })))
          this.$modal.hide('chat-sticker-modal')
        },
        smileSelected: (sticker: string) => {
          const input = this.$refs.input as HTMLInputElement
          if (input.value.length) {
            input.value += ' '
          }
          input.value += sticker
          input.focus()
        }
      })
    },
    photoModalShow() {
      const manId = this.chat.selectedContact!.id
      this.$modal.show('chat-photo-modal', {
        chat: this.chat,
        done: (photo: IPhoto) => {
          this.ws.send(JSON.stringify(new TEvent({
            type: 'send-photo',
            ident: {
              userId: this.user.id,
              girlSiteId: this.chat.account.id,
              type: this.chat.account.type
            },
            payload: {id: photo.id, manId} as ISendPhoto
          })))
          this.$modal.hide('chat-photo-modal')
        }
      })
    },
    videoModalShow() {
      const manId = this.chat.selectedContact!.id
      this.$modal.show('chat-video-modal', {
        chat: this.chat,
        done: (video: IVideo) => {
          this.ws.send(JSON.stringify(new TEvent({
            type: 'send-video',
            ident: {
              userId: this.user.id,
              girlSiteId: this.chat.account.id,
              type: this.chat.account.type
            },
            payload: {id: video.id, manId} as ISendVideo
          })))
        }
      })
    },
    getContactClass(contact: TContact): string {
      // this.$store.dispatch('selectUser', contact)
      let res = 'chat-user-box-one'
      switch (contact.status) {
        case EContactStatus.HasUnreadMessages:
        case EContactStatus.HasForgottenMessages:
        case undefined: // @TODO make more elegant solution
          if (['A', 'R'].includes(this.chat.account.type) && contact.inbox) {
            res += '_orange'
          } else {
            res += '_orange'
          }
          break
        case EContactStatus.NewFavouriteContact:
          res += '_purple'
          break
        default:
          res += '_gray'
          break
      }
      if (contact.status == EContactStatus.HasForgottenMessages) {
        res += ' hot'
      }
      if (contact.profile && contact.profile.vip) {
        res += ' vip'
      }
      if (this.chat.selectedContact == contact) {
        res += ' selected'
      }

      if (contact.profile && contact.profile.birthday) {
        res += ' birthday'
      }

      return res
    },
    userTooltipFix(ev: Event) {
      const target: HTMLInputElement = ev.target as HTMLInputElement
      const width = document.querySelector('.chatting-row')!.clientWidth
      const pos = width - target.getBoundingClientRect().left
      const el = target.querySelector('.user-info')!
      if (pos < 350) {
        el.classList.add('user-info-left');
      } else {
        el.classList.remove('user-info-left');
      }
    }
  }
})
</script>
