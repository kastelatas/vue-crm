<template>
  <modal
    name="chat-sticker-modal"
    height="auto" :scrollable="true"
    @before-open="open"
    @before-close="close"
  >
    <div v-if="params.chat" class="modal-body">
      <span @click="closeModal" style="cursor:pointer;" class="close-icon">
        <img src="/img/icon-close-dialog.png" alt="">
      </span>
      <h4>Send
        <template v-if="mode === 'smiles'">smile</template>
        <template v-else>sticker</template>
        : (
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
        <div v-if="smiles.length || stickers.length" class="btn-group" role="group">
          <button v-if="smiles.length" type="button" class="btn btn-outline-info btn-sm" :class="mode === 'smiles' ? 'active' : ''"
                  @click="mode = 'smiles'">Smiles
          </button>
          <button v-if="stickers.length" type="button" class="btn btn-outline-info btn-sm" :class="mode === 'stickers' ? 'active' : ''"
                  @click="mode = 'stickers'">Stickers
          </button>
        </div>
        <template v-if="mode === 'smiles'">
          <p v-if="!smiles.length" style="margin-top: 15px">No smiles available</p>
          <ul v-else class="stickers no-select">
            <li v-for="stickerGroup in smiles">
              <template v-if="['D', 'N', 'F'].includes(params.chat.account.type)">
                <div v-for="sticker in stickerGroup.stickers" class="sticker"
                     @click="selectSmile(stickerGroup.group, sticker.name, params.chat.account.type)">
                  <div class="smile" :style="'background: url(' + sticker.src + ')'"></div>
                </div>
              </template>
              <template v-else>
                <div v-for="sticker in stickerGroup.stickers" class="sticker"
                     @click="selectSmile(stickerGroup.group, sticker.name, params.chat.account.type)">
                  <img :src="sticker.src" :alt="sticker.name" :title="sticker.name"/>
                </div>
              </template>
            </li>
          </ul>
        </template>
        <template v-else-if="mode === 'stickers'">
          <p v-if="!stickers.length" style="margin-top: 15px">No stickers available</p>
          <ul v-else class="stickers no-select">
            <li v-for="stickerGroup in stickers">
              <div v-for="sticker in stickerGroup.stickers" class="sticker" @click="selectSticker(sticker.name)">
                <img :src="sticker.src" :alt="sticker.name" :title="sticker.name"/>
              </div>
            </li>
          </ul>
        </template>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { IStickers, IStickersGroup, TChat } from '~/types/core'

  interface IEvent {
    params: IParams
  }

  interface IParams {
    chat: TChat
    stickerSelected: (sticker: string) => void
    smileSelected: (sticker: string) => void
  }

  export default Vue.extend({
    data() {
      return {
        loading: false as boolean,
        mode: 'smiles',
        stickers: [] as IStickersGroup[],
        smiles: [] as IStickersGroup[],
        params: {} as IParams
      }
    },
    methods: {
      closeModal(){
        this.$modal.hide('chat-sticker-modal')
      },
      open(event: IEvent) {
        this.params = event.params
        const params = {
          type: this.params.chat.account.type,
          manId: this.params.chat.selectedContact!.id
        }

        this.loading = true
        fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/stickers/' + JSON.stringify(params))
          .then((response: Body) => response.json())
          .then((result: IStickers) => {
            this.loading = false
            this.stickers = result.stickers || []
            this.smiles = result.smiles || []
            if (!this.smiles.length) {
              this.mode = 'stickers'
            }
          })
      },
      selectSticker(name: string) {
        this.params.stickerSelected(name)
      },
      selectSmile(group: string, name: string, t: string = '') {
        if (t === 'D') {
          this.params.smileSelected(atob(name.substr(group.length + 1)))
        } else {
          this.params.smileSelected(name)
        }
      },
      close() {
        this.loading = false
        this.mode = 'smiles'
        this.params = {} as IParams
        this.stickers = []
        this.smiles = []
      }
    }
  })
</script>

<style scoped lang="scss">

  h4 {
    margin-bottom: 20px !important;
  }

  .modal-body {
    text-align: center;
  }


  .stickers {
    width: 515px;
    margin: 22px auto;
    padding-left: 0;
    overflow: hidden;

    li {
      float: left;
      padding: 5px;
      list-style: none;

      .smile {
        zoom: 0.3;
        width: 180px;
        height: 180px;
      }
    }

    .sticker {
      padding: 7px;
      display: inline-block;
      overflow: hidden;

      > img {
        max-height: 50px;
      }

      &:hover {
        border-color: #7abaff;
        cursor: pointer;
      }

      &.selected {
        background: #7abaff;
      }
    }


  }
  .close-icon {
    position: absolute;
    right: 14px;
    top: 8px;
  }

  .btn-outline-info:not(:disabled):not(.disabled).active {
    background-color: #fd8e73;
    border: 1px solid #fd8e73;
    color: #fff;
    outline: none;
  }
  .btn-outline-info:hover {
    background-color: #fd8e73;
    border: 1px solid #fd8e73;
    color: #fff;
  }

  .btn-outline-info {
    color: #fd8e73;
    border: 1px solid #fd8e73;
  }
  .btn-outline-info:active,
  .btn-outline-info:focus ,
  .btn-outline-info:not(:disabled):not(.disabled).active:focus ,
  .btn-outline-info:not(:disabled):not(.disabled).active:active ,
  {
    outline: none;
    box-shadow: none;
  }
</style>
