<template>
  <div v-if="account" style="padding: 10px 20px">
    <div class="advanced-link-container">
      <a class="advanced-link"
         target="_blank"
         :href="'http://777wt.net/v2-chat-history/chat?girl_site_id=' + account.id + '&topdates_type=' + account.type + '&man_id=' + contact.id">
        Extended history
      </a>
    </div>
    <div class="chat-current-user">
      <div class="img">
        <img v-if="account.avatar" :src="account.avatar + '&token='+$route.query.key" alt=""/>
        <img v-else src="/img/no-avatar.png" alt=""/>
      </div>
      <h6 class="no-select" @dblclick="copyAccount">{{ account.name }} <span class="chat-current-id">{{ account.id }} {{ account.type }}</span>
      </h6>
      <span class="icon-close-dialog" @click="$emit('close')">
        <inline-svg src="./img/close.svg" />
      </span>
    </div>
    <div class="chat-current-user user-client">
      <div class="img">
        <img v-if="contact.profile && contact.profile.avatar" :src="contact.profile.avatar" alt=""/>
        <img v-else src="/img/no-avatar.png" alt=""/>
      </div>
      <h6 class="no-select" @dblclick="copyContact">{{ contact && contact.profile && contact.profile.name ? contact.profile.name : contact.id }}</h6>
    </div>
    <div class="input-group">
      <input ref="search" v-model="state.search" class="form-control" placeholder="" @keyup.enter="request"/>
      <div class="input-group-append">
        <button class="btn btn-orange" @click="request"  style="padding: 8px 9px;">
          Search
        </button>
      </div>
    </div>
    <div class="input-group">
      <label>Dates range:</label>
      <DatePicker v-model="state.dates" @change="request" range format="DD.MM.YYYY"/>
    </div>
    <p v-if="loading" style="padding-top: 20px">Loading...</p>
    <div v-else>
      <p v-if="!messages" style="padding-top: 20px">No results</p>
      <div v-else ref="messagesList" class="messages-list" style="padding-top: 20px">
        <div v-for="message in messages" class="messages-dialog" style="overflow: hidden; padding: 0">
          <div class="message-text" :class="message.is_inbox ? 'messages-text_left' : 'messages-text_right'">
            <p v-html="message.message"></p>
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

<script lang="ts">
  import Vue from 'vue';
  import DatePicker from 'vue2-datepicker';
  import {IContact, IGirlIdent, TContact} from '~/types/core';
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
    components: { DatePicker },
    props: {
      account: Object, // as IChatAccount,
      contact: TContact
    },
    data() {
      return {
        loading: false as boolean,
        search: '',
        messages: null as TMessage[] | null,
        state: { search: '', dates: [] as Date[] }
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
    mounted() {
      this.request();
    },
    methods: {
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
      copyAccount() {
        const el = document.createElement('textarea');
        el.value = this.account.type + '#' + this.account.id;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      },
      copyContact(contact: IContact) {
        const el = document.createElement('textarea');
        el.value = this.account.name.trim() + ' ' + this.account.id + ' ' + this.account.type +
          '\n/ ' + (contact.profile ? contact.profile.name + ' ' : '') + contact.id
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      },
      scroll() {
        const el = this.$refs.messagesList as HTMLElement;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      }
    }
  })
</script>

<style lang="scss">
  .right-sidebar {
    .advanced-link-container {
      text-align: center;

      .advanced-link {
        font-size: 90%;
      }
    }

    .chat-current-user.user-client {
      zoom: 0.8;
      width: 70%;
      position: relative;
      padding-top: 0;
      margin: auto auto 10px;
    }

    .messages-dialog {
      margin-bottom: 0;
    }

    .messages-text_right {
      border: 1px solid #ddd;
    }

    .mx-input {
      text-align: center !important;
    }

    label {
      font-size: 90%;
      position: relative;
      top: 4px;
    }
  }
</style>
