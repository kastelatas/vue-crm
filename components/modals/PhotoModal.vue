<template>
  <modal
    name="chat-photo-modal"
    height="auto" :scrollable="true"
    @before-open="open"
    @before-close="close"
  >
    <div v-if="params.chat" class="modal-body">
      <span @click="closeModal" style="cursor:pointer;" class="close-icon">
       <inline-svg src="/img/close.svg"/>
      </span>
      <h4>Send photo: (
        <template v-if="params.chat.selectedContact.profile && params.chat.selectedContact.profile.name">
          {{ params.chat.selectedContact.profile.name }}
        </template>
        <small>
          {{ params.chat.account.type }}#{{ params.chat.selectedContact.id }}
        </small>
        )</h4>
      <p v-if="loading">Loading...</p>
      <div v-else>
        <p v-if="!photos.length">No photos available</p>
        <div v-else class="popup-upload-list">
          <div
            v-for="(photo, index) in photos"
            class="upload-list-img"
            :class="selected === index ? 'active' : ''"
            @click="selected = index">
            <img :src="photo.src" alt=""/>
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
  import Vue from 'vue';
  import { IGirlIdent, IManIdent, IPhoto, TChat } from '~/types/core';

  interface IEvent {
    params: IParams
  }

  interface IParams {
    chat: TChat
    done: (photo: IPhoto) => void
  }

  export default Vue.extend({
    data() {
      return {
        loading: false as boolean,
        selected: null as number | null,
        photos: [] as IPhoto[],
        params: {} as IParams
      }
    },
    methods: {
      open(event: IEvent) {
        this.params = event.params
        const params = {
          ident: { // TODO userId
            girlSiteId: this.params.chat.account.id,
            type: this.params.chat.account.type
          } as IGirlIdent,
          payload: {
            manId: this.params.chat.selectedContact!.id
          } as IManIdent
        }

        this.loading = true;
        fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/photos/' + JSON.stringify(params))
          .then((response: Body) => response.json())
          .then((result: IPhoto[]) => {
            this.loading = false;
            this.photos = result || [];
            for (const photo of this.photos) {
              photo.src += '&token=' + this.$route.query.key
            }
          });
      },
      send() {
        this.params.done(this.photos[this.selected!]);
      },
      close() {
        this.selected = null;
        this.loading = false;
        this.params = {} as IParams;
        this.photos = [] as IPhoto[];
      },
      closeModal(){
        this.$modal.hide('chat-photo-modal')
      }
    }
  })
</script>

<style scoped lang="scss">

  .modal-body {
    text-align: center;
  }

  h4 {
    margin-bottom: 20px!important;
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
