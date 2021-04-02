<template>
  <div v-if="state.account" class="after-chat-texts-panel">
    <strong class="title">After chat templates</strong>
    <div class="chat-current-user">
      <div class="img">
        <img v-if="state.account.avatar" :src="state.account.avatar + '&token='+$route.query.key" alt=""/>
        <img v-else src="/img/no-avatar.png" alt=""/>
      </div>
      <h6 class="no-select" @dblclick="copyAccount">{{ state.account.name }} <span
        class="chat-current-id">{{ state.account.id }} {{ state.account.type }}</span>
      </h6>
    </div>

    <div class="chat-current-user user-client">
      <div class="img">
        <img v-if="state.client.profile && state.client.profile.avatar" :src="state.client.profile.avatar" alt=""/>
        <img v-else src="/img/no-avatar.png" alt=""/>
      </div>
      <h6 class="no-select" @dblclick="copyClient()">
        {{ state.client.profile && state.client.profile.name }}
        <span class="chat-current-id">{{ state.client.id }} {{ state.account.type }}</span>
      </h6>
      <div class="capability">
        <span v-if="state.client.state && state.client.state.hasChats" class="icon-msg-count"
              @click.stop="openHistory(state.client)"></span>
      </div>
    </div>

    <span class="messages-count">Inbox messages: <span class="value">{{ state.messagesCount }}</span></span>

    <form @submit.prevent="save">
      <div class="form-group">
        <label>Template</label>
        <select v-model="state.current.id" class="form-control" @change="select">
          <option :value="null">...</option>
          <option v-for="template in state.templates" :value="template.id">{{ template.subject }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Subject</label>
        <input v-model="state.current.subject" required class="form-control" @keydown="change"/>
      </div>
      <div class="form-group">
        <label>Text</label>
        <textarea v-model="state.current.text" required class="form-control" rows="7" @keydown="change"></textarea>
        <span class="chars-count">{{ charsCount }}</span>
      </div>
      <button :disabled="saving" class="btn btn-orange" style="width:100%">
        Send
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {IAfterChatText, IGirlIdent, IClient} from '~/types/core';
import 'vue2-datepicker/index.css';

interface IPayload {
  manId: number
}

export default Vue.extend({
  props: {
    state: Object
  },
  data() {
    return {
      loading: false as boolean,
      saving: false as boolean
    }
  },
  computed: {
    charsCount(): number {
      const text = this.state.current.text.replace(/[\s]+/gis, '')
      return text.length
    }
  },
  methods: {
    save() {
      if (this.charsCount < 310) {
        alert('Minimum length for after chat message is 310 characters.')
        return
      }

      this.saving = true
      const params = {
        ident: {
          girlSiteId: this.state.account.id,
          type: this.state.account.type
        } as IGirlIdent,
        payload: {
          manId: this.state.client.id,
          template: this.state.current
        } as IPayload
      };
      const url = 'http://' + (process.env.API_HOST || location.hostname + ':7777') + '/save-after-chat-text/'
      fetch(url, {method: 'POST', body: JSON.stringify(params)}).then(() => {
        this.saving = false
        this.state.templates = []
        this.state.current = {id: null, subject: '', text: ''}
        this.state.account = null
        this.state.client = null
        this.$emit('saved');
      });
    },
    select() {
      const value = this.state.current.id
      if (value && this.state.templates) {
        const result = this.state.templates.filter((obj: IAfterChatText) => {
          return obj.id === Number(value)
        })
        if (result.length) {
          this.state.current.subject = result[0].subject
          this.state.current.text = result[0].text
        }
      } else {
        this.state.current = {id: null, subject: '', text: ''}
      }
    },
    change() {
      this.state.current.id = null
    },
    copyAccount() {
      const el = document.createElement('textarea');
      el.value = this.state.account.type + '#' + this.state.account.id;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },
    copyClient() {
      const el = document.createElement('textarea');
      el.value = this.state.account.name.trim() + ' ' + this.state.account.id + ' ' + this.state.account.type +
        '\n/ ' + (this.state.client.profile ? this.state.client.profile.name + ' ' : '') + this.state.client.id
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },
    openHistory(client: IClient) {
      const url = '/' + this.state.account.type + '/' + this.state.account.id + '/' + client.id + '/history'
      window.open(url, '_blank')!.focus()
    }
  }
})
</script>

<style lang="scss">
.title {
  color: #999;
  font-size: 14px;
  text-align: center;
  display: block;
}

.after-chat-texts-panel {
  padding: 10px 20px;

  .chat-current-user.user-client {
    zoom: 0.8;
    margin: auto;
    width: 70%;
    position: relative;
    padding-top: 0;
    padding-bottom: 0;
  }

  .icon-msg-count {
    position: inherit;
  }

  .messages-count {
    display: block;
    text-align: center;
    font-size: 12px;

    .value {
      font-size: 11px;
      color: #c0c3cc;
    }
  }

  form {
    position: relative;

    .chars-count {
      font-size: 11px;
      color: #b3b6bf;
      position: absolute;
      right: 10px;
      bottom: 33px;
    }
  }
}
</style>
