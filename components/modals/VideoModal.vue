<template>
  <modal
    name="chat-video-modal"
    width="850"
    height="auto" :scrollable="true"
    @before-open="open"
    @before-close="close"
    class="chat-video-modal"
  >
    <div v-if="params.chat" class="modal-body">
        <span @click="closeModal" style="cursor:pointer;" class="close-icon">
          <inline-svg src="/img/close.svg"/>
        </span>
      <h4>Send video: (
        <template v-if="params.chat.selectedContact.profile && params.chat.selectedContact.profile.name">
          {{ params.chat.selectedContact.profile.name }}
        </template>
        <small>
          {{ params.chat.account.type }}#{{ params.chat.selectedContact.id }}
        </small>
        )
      </h4>
      <p v-if="loading">Loading...</p>
      <div v-else>
        <p v-if="!videos.length">No videos available</p>
        <div v-else class="popup-upload-list">
          <div
            v-for="(video, index) in videos"
            class="upload-list-img video"
            :class="selected === index ? 'active' : ''"
            @click="selected = index">
            <div class="video-container">
              <span class="video-title">{{ video.title }}</span>
              <!--              <video :src="video.src"></video>-->

              <img :src="video.src" alt="">
              <!--              <img src="/img/video.png" :title="video.title" :alt="video.title"/>-->
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selected !== null" class="modal-footer">
      <button type="submit" class="btn-submit" @click="send">Send</button>
    </div>
  </modal>
</template>

<script lang="ts">
import Vue from 'vue'
import {IGirlIdent, IManIdent, IVideo, TChat} from '~/types/core'

interface IEvent {
  params: IParams
}

interface IParams {
  chat: TChat
  done: (video: IVideo) => void
}

export default Vue.extend({
  data() {
    return {
      loading: false as boolean,
      selected: null as number | null,
      videos: [] as IVideo[],
      params: {} as IParams
    }
  },
  methods: {
    open(event: IEvent) {
      this.params = event.params
      const params = {
        token: this.$route.query.key as String,
        ident: { // TODO userId
          girlSiteId: this.params.chat.account.id,
          type: this.params.chat.account.type
        } as IGirlIdent,
        payload: {
          manId: this.params.chat.selectedContact!.id
        } as IManIdent
      }

      this.loading = true
      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/videos/' + JSON.stringify(params))
        .then((response: Body) => response.json())
        .then((result: IVideo[]) => {
          this.loading = false
          this.videos = result
        })
    },
    send() {
      this.params.done(this.videos[this.selected!])
      this.close()
    },
    close() {
      this.selected = null
      this.loading = false
      this.params = {} as IParams
      this.videos = [] as IVideo[]
    },
    closeModal() {
      this.$modal.hide('chat-video-modal')
    }
  }
})
</script>

<style scoped lang="scss">

.modal-body {
  text-align: center
}

h4 {
  margin-bottom: 20px !important;
}

.video-container {
  display: inline-block;
}

.video-title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5px;
  color: #fff;
  font-size: 11px;
}

.close-icon {
  position: absolute;
  right: 14px;
  top: 8px;
  svg {
    width: 9px;
    height: 10px;
    fill:#b9bcc7
  }
}
</style>
