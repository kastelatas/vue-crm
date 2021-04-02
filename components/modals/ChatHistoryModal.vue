<template>
  <div class="modal-about modal-history">
    <div style="position:relative;">

    </div>
    <template v-if="!account && !contact">
      <Loader/>
      <div class="close-icon" @click="$emit('close')">
        <inline-svg src="/img/close.svg"/>
      </div>
    </template>
    <template v-else>

      <div class="modal-about__header drag-handle">
        <div class="close-icon" @click="$emit('close')">
          <inline-svg src="/img/close.svg"/>
        </div>

        <div class="modal-row flex-md-row  w-100">
          <div class="modal-row flex-md-row" style="margin-right: 20px;">
            <img v-if="account.avatar" :src="account.avatar + '&token='+$route.query.key" alt="" class="avatar"/>
            <div class="modal-row">
              <p class="name">{{ account.name }} {{ account.lastname }}</p>
              <p class="id">{{ account.id }} {{ account.type }}</p>
            </div>
          </div>

          <div class="modal-row flex-md-row align-items-center">
            <img v-if="contact.profile && contact.profile.avatar" :src="contact.profile.avatar" class="avatar"/>
            <img v-else src="/img/no-avatar.png" alt="" class="avatar"/>
            <div class="modal-row">
              <p class="name">{{
                  contact && contact.profile && contact.profile.name ? contact.profile.name : contact.id
                }}</p>
            </div>
          </div>
        </div>

      </div>

      <div class="modal-about__content">
        <div class="modal-row flex-md-row align-items-center search-block">
          <div class="input-group">
            <input ref="search" v-model="state.search" class="form-control" placeholder="" @keyup.enter="request"/>
            <div class="input-group-append">
              <button class="btn btn-orange" @click="request" style="padding: 8px 9px;">
                Search
              </button>
            </div>
          </div>
          <div class="input-group">
            <label>Dates range:</label>
            <DatePicker v-model="state.dates" @change="request" range format="DD.MM.YYYY"/>
          </div>
        </div>
        <p v-if="loading" style="padding-top: 20px">Loading...</p>
        <div v-else>
          <p v-if="!messages" style="padding-top: 20px">No results</p>
          <div v-else ref="messagesList" class="messages-list" style="padding-top: 20px">
            <div v-for="message in messages" class="messages-dialog" style="overflow: hidden; padding: 0">
              <div class="message-text" :class="message.is_inbox ? 'messages-text_left' : 'messages-text_right'">
                <p v-html="compileMessage(message)"></p>
                <div class="time-date-message">
                  <span>{{ message.created_at | date }}</span>
                  <span>{{ message.created_at | time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>


  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import Loader from '@/components/Loader.vue'
import DatePicker from 'vue2-datepicker';
import {IContact, IGirlIdent, IMessage, TContact} from '~/types/core';
import 'vue2-datepicker/index.css';

interface TResponse {
  payload: TMessage[],
  paging: {
    pages: number
  }
}

interface IPayload {
  manId: number
  search: string
  from: string
  to: string
}

interface TMessage {
  'message_id': number
  'created_at': number
  'is_inbox': boolean
  'message': string
}

export default Vue.extend({
  props: {
    account: Object, // as IChatAccount,
    contact: TContact
  },
  components: {Loader, DatePicker},
  data() {
    return {
      loading: false as boolean,
      search: '',
      messages: null as TMessage[] | null,
      state: {search: '', dates: [] as Date[]}
    }
  },
  watch: {
    contact() {
      this.messages = null;
      this.state.search = '';
      this.state.dates = [];
      this.search = '';
      this.request();
    }
  },
  methods: {
    compileMessage(message: any) {
      let result = message && message?.message.replace(
        'events/chat-image-updated?',
        'events/chat-image-updated?token=' + this.$route.query.key + '&'
      )
      if (message.letter) {
        result = '✉ ' + result + ' ✉'
      }
      return result
    },
    hide() {
      this.$emit('hideModal')
    },
    request() {
      this.loading = true;
      const input = this.$refs.search as HTMLInputElement;
      this.search = input.value

      let from: string | null = null;
      if (this.state.dates[0]) {
        const date = new Date();
        date.setDate(this.state.dates[0].getDate());
        from = date.toJSON().slice(0, 10);
      }

      let to: string | null = null;
      if (this.state.dates[1]) {
        const date = new Date();
        date.setDate(this.state.dates[1].getDate());
        to = date.toJSON().slice(0, 10);
      }

      const params = {
        ident: {
          girlSiteId: this.account.id,
          type: this.account.type
        } as IGirlIdent,
        payload: {
          manId: this.contact.id,
          search: this.search,
          from,
          to
        } as IPayload
      };

      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/history/' + JSON.stringify(params))
        .then((response: Body) => response.json())
        .then((result: TResponse) => {
          this.loading = false;
          this.messages = result.payload;
          setTimeout(() => {
            this.scroll();
          })
        });
    },
    scroll() {
      const el = this.$refs.messagesList as HTMLElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }

  },
  mounted() {
    this.request();
  },
  fetch() {

  }
})
</script>
