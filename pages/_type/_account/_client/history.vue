<template>
  <div v-if="!profiles.man_info && !profiles.girl_info ">
    <Loader/>
  </div>
  <div class="history-page" v-else>
    <!--    <div v-if="response" class="history-account">-->
    <!--      <h4>{{ response.payload.account.name }}</h4>-->
    <!--      <img class="img" :src="response.payload.account.avatar" alt="" style="height: 133px"/>-->
    <!--      <h6>{{ response.payload.account.type }} #{{ response.payload.account.id }}</h6>-->
    <!--    </div>-->
    <!--    <div v-if="response" class="history-contact">-->
    <!--      <div v-if="response.payload.contact.profile">-->
    <!--        <h6>{{ response.payload.contact.profile.name }}</h6>-->
    <!--        <img class="img" :src="response.payload.contact.profile.avatar" alt=""/>-->
    <!--      </div>-->
    <!--      <h6>#{{ response.payload.contact.manId }}</h6>-->
    <!--    </div>-->
    <!--    <div v-if="response" class="advanced-link-container">-->
    <!--      <a target="_blank" class="advanced-link"-->
    <!--        :href="'http://777wt.net/v2-chat-history/chat?girl_site_id=' + response.payload.account.id-->
    <!--           + '&topdates_type=' + response.payload.account.type + '&man_id=' + response.payload.contact.manId">-->
    <!--        Extended history-->
    <!--      </a>-->
    <!--    </div>-->

    <!--    <hr v-if="response"/>-->
    <div class="content">
      <b-tabs content-class="mt-3">
        <b-tab title="Chat history" active>
          <div class="fl-row flex-md-row align-items-center search-block">
            <div class="input-group">
              <input ref="search" v-model="state.search" class="form-control" placeholder="" @keyup.enter="request"/>
              <div class="input-group-append">
                <button class="btn btn-orange" style="padding: 8px 9px;" @click="request">
                  Search
                </button>
              </div>
            </div>
            <div class="input-group">
              <label>Dates range: &nbsp;</label>
              <DatePicker v-model="state.dates" range format="DD.MM.YYYY"/>
            </div>
          </div>
          <div class="history-list">
            <p v-if="loading" style="padding-top: 20px">Loading...</p>
            <div v-else-if="response">
              <p v-if="!response.payload.messages" style="padding-top: 20px">No results</p>
              <div v-else ref="messagesList" class="messages-list" style="padding-top: 20px">
                <div v-for="message in messages ? messages : response.payload.messages" class="messages-dialog"
                     style="overflow: hidden; padding: 0">

                  <div class="message-text" :class="message.is_inbox ? 'messages-text_right' : 'messages-text_left'">
                    <div :class="message.is_inbox ? 'message-row' : 'message-row-reverse'">
                      <img :src="response.payload.account.avatar + '&token=' + $route.params.page" alt=""
                           v-if="!message.is_inbox" class="has-img">
                      <span v-if="profiles.man_info && profiles.man_info.avatar">
                      <img :src="profiles.man_info.avatar" alt="" v-if="message.is_inbox" class="has-img">
                    </span>
                      <span v-else-if="!response.payload.contact.profile.avatar">
                       <span class="no_avatar-img" v-if="message.is_inbox">
                       </span>
                    </span>
                      <div style="max-width: 80%">
                        <p v-html="compileMessage(message)" @click="openPicture(message)" :style="{
                          'cursor': message.message.includes('img') ? 'pointer' : 'auto'
                        }"></p>
                      </div>
                    </div>
                    <div class="time-date-message" :class="message.is_inbox ? 'message-row' : 'message-row-reverse'">
                     <span>
                        <span>{{ message.created_at | date }}</span>
                      <span>{{ message.created_at | time }}</span>
                     </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ul v-if="response && response.paging.pages > 1" class="pagination pagination pagination-sm">
            <li v-if="page > 1" class="page-item">
              <router-link class="page-link text-secondary" :to="{params: {page: page - 1}}">Previous</router-link>
            </li>
            <li v-for="i in response.paging.pages" class="page-item" :class="page === i ? 'active' : ''">
              <router-link class="page-link" :class="page !== i ? 'text-secondary' : ''" :to="{params: {page: i}}">{{
                  i
                }}
              </router-link>
            </li>
            <li v-if="page < response.paging.pages" class="page-item">
              <router-link class="page-link text-secondary" :to="{params: {page: page + 1}}">Next</router-link>
            </li>
          </ul>
        </b-tab>
        <b-tab
          :title="this.profiles.girl_info && this.profiles.girl_info.name + ' ' + this.profiles.girl_info.id ">
          <div class="history-tab__container" v-if="this.profiles.girl_info">
            <template>
              <!--              <div class="modal-about__header drag-handle">-->
              <!--                <div class="modal-row flex-md-row align-items-center"-->
              <!--                     :class="{'active-type': profiles.girl_info.topdates_type !== 'D'}" style="margin-right: 40px;">-->
              <!--                  <img v-if="profiles.girl_info.avatar" :src="profiles.girl_info.avatar" alt="" class="avatar"/>-->
              <!--                  <img v-else src="/img/no-avatar.png" alt="" class="avatar"/>-->
              <!--                  <div class="modal-row">-->
              <!--                    <p class="name">{{ profiles.girl_info.name }} {{ profiles.girl_info.lastname }}</p>-->
              <!--                    <p class="id">{{ profiles.girl_info.girl_site_id ? profiles.girl_info.girl_site_id : profiles.man_info.man_site_id }}-->
              <!--                      {{ profiles.girl_info.topdates_type }}</p>-->
              <!--                  </div>-->
              <!--                </div>-->
              <!--              </div>-->

                <div :style="`background: url(${this.profiles.girl_info.cover})`">
                  <div
                    :style="`background:url(${this.profiles.girl_info.cover_v2 ? this.profiles.girl_info.cover_v2 : ''}) ` "
                    class="history-tab__cover">
                    <img :src="this.profiles.girl_info.avatar" class="history-tab__ava">
                  </div>
                </div>


                  <div class="modal-about__content">
                    <div class="modal-row" v-if="profiles.girl_info.extra_information">
                      <p class="title about">
                        Information:
                      </p>
                      <p class="about-text">
                        {{ profiles.girl_info.extra_information }}
                      </p>
                    </div>
                    <div class="modal-row " v-if="profiles.girl_info.comment">
          <span class="rewrite-comment">
            <inline-svg src="./img/edit.svg"/>
          </span>
                      <div>
                        <p class="title about">
                          Comments:
                        </p>
                        <p class="about-text">
                          {{ profiles.girl_info.comment }}
                        </p>
                      </div>
                    </div>
                    <div class="modal-row">
                      <p class="title about">
                        About:
                      </p>
                      <p class="about-text">
                        {{ profiles.girl_info.character }}
                      </p>
                    </div>
                    <div class="modal-row">
                      <p class="title looking">
                        Looking for:
                      </p>
                      <p class="looking-text" v-html="profiles.girl_info.mans_description">
                      </p>
                    </div>

                    <div class="about-person__block">
                      <div class="left-row">
                        <div class="modal-row">
                          <p class="title">Birthday:</p>
                          <p class="text">{{ new Date(profiles.girl_info.birthdate).toLocaleDateString() }}
                            <!--                        <span style="color:#c0c3cc"> ({{ currentAge(profiles.birthdate) }}) </span>-->
                          </p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Weight:</p>
                          <p class="text">{{ profiles.girl_info.weight }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">City:</p>
                          <p class="text">{{ profiles.girl_info.city }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Country:</p>
                          <p class="text">{{ profiles.girl_info.country }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Drink:</p>
                          <p class="text">{{ profiles.girl_info.alcohol }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Education:</p>
                          <p class="text">{{ profiles.girl_info.education }}</p>
                        </div>
                      </div>
                      <div class="right-row">

                        <div class="modal-row">
                          <p class="title">Eye:</p>
                          <p class="text">{{ profiles.girl_info.eyes_color }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Hair:</p>
                          <p class="text">{{ profiles.girl_info.hair_color }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Height:</p>
                          <p class="text">{{ profiles.girl_info.height }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Kids:</p>
                          <p class="text">{{ profiles.girl_info.children }} </p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Occupation:</p>
                          <p class="text">{{ profiles.girl_info.occupation }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Relationship:</p>
                          <p class="text">{{ profiles.girl_info.marital_status }}</p>
                        </div>
                        <div class="modal-row">
                          <p class="title">Smoke</p>
                          <p class="text">{{ profiles.girl_info.smoking }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="interests-block">
                      <p class="title">Interests:</p>
                      <p class="text" v-if="profiles.girl_info.interests">
                        {{ getFormatInterests(profiles.girl_info.interests) }}
                      </p>
                    </div>
                    <div class="modal-row">
                      <div class="gallery-block">
                        <p class="title">Gallery</p>
                        <div class="gallery-block__imgs">
                          <div class="imgs" v-for="(photos, index) of profiles.girl_info.photos">
                            <clazy-load :src="photos">
                              <img :src="photos" class="img" @click="openPhoto({index:index, type: 'girl'})">
                              <div slot="placeholder">
                                <img :src="photos" class="img" style="filter: blur(10px);">
                              </div>
                            </clazy-load>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

            </template>

            <!--            <div class="history-tab__row">-->
            <!--              <div>-->
            <!--                <div :style="`background: url(${this.profiles.man_info.data.cover})`">-->
            <!--                  <div-->
            <!--                    :style="`background:url(${this.profiles.man_info.data.cover_v2 ? this.profiles.man_info.data.cover_v2 : ''}) ` "-->
            <!--                    class="history-tab__cover">-->
            <!--                    <img :src="this.profiles.man_info.data.avatar" class="history-tab__ava">-->
            <!--                  </div>-->
            <!--                </div>-->
            <!--                <div>-->
            <!--                  <br>-->
            <!--                  <div class="history-tab__row fl-row js-space-around">-->
            <!--                    <div>-->
            <!--                      <p class="history-tab__name"> Name: {{ this.profiles.man_info.data.info.name }}</p>-->
            <!--                      <p class="history-tab__name"> Birthday: {{ this.profiles.man_info.data.info.birthday }}</p>-->
            <!--                      <p class="history-tab__name"> Bodytype: {{ this.profiles.man_info.data.info.bodytype }}</p>-->
            <!--                      <p class="history-tab__name"> City: {{ this.profiles.man_info.data.info.city }}</p>-->
            <!--                      <p class="history-tab__name"> Country: {{ this.profiles.man_info.data.info.country }}</p>-->
            <!--                      <p class="history-tab__name"> Drink: {{ this.profiles.man_info.data.info.drink }}</p>-->
            <!--                      <p class="history-tab__name"> Education: {{ this.profiles.man_info.data.info.education }}</p>-->
            <!--                    </div>-->
            <!--                    <div>-->
            <!--                      <p class="history-tab__name"> Eye: {{ this.profiles.man_info.data.info.eye }}</p>-->
            <!--                      <p class="history-tab__name"> Hair: {{ this.profiles.man_info.data.info.hair }}</p>-->
            <!--                      <p class="history-tab__name"> Height: {{ this.profiles.man_info.data.info.height }}</p>-->
            <!--                      <p class="history-tab__name"> Kids: {{ this.profiles.man_info.data.info.kids }}</p>-->
            <!--                      <p class="history-tab__name"> Occupation: {{ this.profiles.man_info.data.info.occupation }}</p>-->
            <!--                      <p class="history-tab__name"> Telationship:-->
            <!--                        {{ this.profiles.man_info.data.info.relationship }}</p>-->
            <!--                      <p class="history-tab__name"> Smoke: {{ this.profiles.man_info.data.info.smoke }}</p>-->
            <!--                    </div>-->
            <!--                  </div>-->
            <!--                  <br>-->
            <!--                </div>-->
            <!--                <div class="history-tab__interests">-->
            <!--                  <span>Interests:</span> <br>-->
            <!--                  <span v-for="interests of this.profiles.man_info.data.interests" class="label">-->
            <!--                      {{ interests }}-->
            <!--                 </span>-->
            <!--                </div>-->

            <!--                <span class="history-tab__about">-->
            <!--                <span>  About:</span>-->
            <!--                  <p>{{ this.profiles.man_info.data.info.about }}</p>-->
            <!--                </span>-->
            <!--                <span class="history-tab__looking-for">-->
            <!--                 <span> Looking for:</span>-->
            <!--                  <p v-html="this.profiles.man_info.data.looking_for"> </p>-->
            <!--                </span>-->
            <!--                <div class="history-tab__gallery" v-if="this.profiles.man_info.data.photos">-->
            <!--                  <span>-->
            <!--                    <span>Gallery:</span> <br> <br> </span>-->
            <!--                   <div style="display: flex; flex-wrap: wrap">-->
            <!--                    <div v-for="photos of this.profiles.man_info.data.photos" style="width:200px; margin-right: 10px;">-->
            <!--                      <clazy-load :src="photos">-->
            <!--&lt;!&ndash;                        <img :src="`${photos}.215x180.thumb-fd`" alt=""  @click="openPhoto({index:index, type: 'man'})">&ndash;&gt;-->
            <!--                        <img :src="`${photos}.215x180.thumb-fd`" alt=""  >-->
            <!--                        <div slot="placeholder">-->
            <!--                          <img :src="photos" class="img" style="filter: blur(10px);">-->
            <!--                        </div>-->
            <!--                      </clazy-load>-->
            <!--                    </div>-->
            <!--                  </div>-->
            <!--                </div>-->
            <!--              </div>-->
            <!--            </div>-->
          </div>
        </b-tab>
        <b-tab
          :title="this.profiles.man_info && this.profiles.man_info.name + ' ' + this.profiles.man_info.id ">
          <div class="history-tab__container" v-if="this.profiles.man_info">
            <template>
              <!--              <div class="modal-about__header drag-handle">-->
              <!--                <div class="modal-row flex-md-row align-items-center"-->
              <!--                     :class="{'active-type': profiles.girl_info.topdates_type !== 'D'}" style="margin-right: 40px;">-->
              <!--                  <img v-if="profiles.girl_info.avatar" :src="profiles.girl_info.avatar" alt="" class="avatar"/>-->
              <!--                  <img v-else src="/img/no-avatar.png" alt="" class="avatar"/>-->
              <!--                  <div class="modal-row">-->
              <!--                    <p class="name">{{ profiles.girl_info.name }} {{ profiles.girl_info.lastname }}</p>-->
              <!--                    <p class="id">{{ profiles.girl_info.girl_site_id ? profiles.girl_info.girl_site_id : profiles.man_info.man_site_id }}-->
              <!--                      {{ profiles.girl_info.topdates_type }}</p>-->
              <!--                  </div>-->
              <!--                </div>-->
              <!--              </div>-->

              <div :style="`background: url(${this.profiles.man_info.cover})`">
                <div
                  :style="`background:url(${this.profiles.man_info.cover_v2 ? this.profiles.man_info.cover_v2 : ''}) ` "
                  class="history-tab__cover">
                  <img :src="this.profiles.man_info.avatar" class="history-tab__ava">
                </div>
              </div>


              <div class="modal-about__content">
                <div class="modal-row" v-if="profiles.man_info.extra_information">
                  <p class="title about">
                    Information:
                  </p>
                  <p class="about-text">
                    {{ profiles.man_info.extra_information }}
                  </p>
                </div>
                <div class="modal-row " v-if="profiles.man_info.comment">
          <span class="rewrite-comment">
            <inline-svg src="./img/edit.svg"/>
          </span>
                  <div>
                    <p class="title about">
                      Comments:
                    </p>
                    <p class="about-text">
                      {{ profiles.man_info.comment }}
                    </p>
                  </div>
                </div>
                <div class="modal-row">
                  <p class="title about">
                    About:
                  </p>
                  <p class="about-text">
                    {{ profiles.man_info.character }}
                  </p>
                </div>
                <div class="modal-row">
                  <p class="title looking">
                    Looking for:
                  </p>
                  <p class="looking-text" v-html="profiles.man_info.mans_description">
                  </p>
                </div>

                <div class="about-person__block">
                  <div class="left-row">
                    <div class="modal-row">
                      <p class="title">Birthday:</p>
                      <p class="text">{{ new Date(profiles.man_info.birthdate).toLocaleDateString() }}
                        <!--                        <span style="color:#c0c3cc"> ({{ currentAge(profiles.birthdate) }}) </span>-->
                      </p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Weight:</p>
                      <p class="text">{{ profiles.man_info.weight }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">City:</p>
                      <p class="text">{{ profiles.man_info.city }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Country:</p>
                      <p class="text">{{ profiles.man_info.country }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Drink:</p>
                      <p class="text">{{ profiles.man_info.alcohol }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Education:</p>
                      <p class="text">{{ profiles.man_info.education }}</p>
                    </div>
                  </div>
                  <div class="right-row">

                    <div class="modal-row">
                      <p class="title">Eye:</p>
                      <p class="text">{{ profiles.man_info.eyes_color }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Hair:</p>
                      <p class="text">{{ profiles.man_info.hair_color }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Height:</p>
                      <p class="text">{{ profiles.man_info.height }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Kids:</p>
                      <p class="text">{{ profiles.man_info.children }} </p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Occupation:</p>
                      <p class="text">{{ profiles.man_info.occupation }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Relationship:</p>
                      <p class="text">{{ profiles.man_info.marital_status }}</p>
                    </div>
                    <div class="modal-row">
                      <p class="title">Smoke</p>
                      <p class="text">{{ profiles.man_info.smoking }}</p>
                    </div>
                  </div>
                </div>
                <div class="interests-block">
                  <p class="title">Interests:</p>
                  <p class="text" v-if="profiles.man_info.interests">
                    {{ getFormatInterests(profiles.man_info.interests) }}
                  </p>
                </div>
                <div class="modal-row">
                  <div class="gallery-block">
                    <p class="title">Gallery</p>
                    <div class="gallery-block__imgs">
                      <div class="imgs" v-for="(photos, index) of profiles.man_info.photos">
                        <clazy-load :src="photos">
                          <img :src="photos" class="img"  @click="openPhoto({index:index, type: 'man'})">
                          <div slot="placeholder">
                            <img :src="photos" class="img" style="filter: blur(10px);">
                          </div>
                        </clazy-load>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </b-tab>
      </b-tabs>
    </div>
    <template v-if="imgSrc">
      <ShowPictureModal :img="imgSrc" @close="close"/>
    </template>
        <template v-if="profiles.girl_info.photos">
          <light-box ref="lightbox" :media="photosLightboxData()" :show-light-box="false" v-if="profiles.girl_info.photos"/>
        </template>
        <template v-if="profiles.man_info.photos">
          <light-box ref="lightbox2" :media="photosLightboxDataMan()" :show-light-box="false" v-if="profiles.man_info.photos"/>
        </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {IAccount, IClientProfile, IGirlIdent, IManIdent} from '~/types/core';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import Loader from '@/components/Loader.vue'
import ShowPictureModal from "~/components/modals/ShowPictureModal.vue";
import 'vue-image-lightbox/dist/vue-image-lightbox.min.css'
// import {BootstrapVue} from 'bootstrap-vue'
// import VueEasyLightbox from 'vue-easy-lightbox'

// Vue.use(BootstrapVue)


interface IPayload {
  manId: number
  search: string
  from: string
  to: string
}


interface TResponse {
  payload: {
    messages: TMessage[],
    account: IAccount,
    contact: {
      manId: number,
      profile: IClientProfile
    }
  },
  paging: {
    pages: number
  }
}

interface TMessage {
  'message_id': number
  'created_at': number
  'is_inbox': boolean
  'message': string
}

export default Vue.extend({
  components: {DatePicker, Loader, ShowPictureModal},
  data() {
    return {
      // state: {loading: true},
      response: null as TResponse | null,
      controller: null as AbortController | null,
      profiles: [] as any,
      visible: false,
      index: 0, // default: 0
      loading: false as boolean,
      search: '',
      messages: null as TMessage[] | null,
      state: {search: '', dates: [] as Date[]},
      imgSrc: '' as String
    }
  },
  computed: {
    page(): number {
      return this.$route.params.page ? Number(this.$route.params.page) : 1;
    },
  },
  created() {
    this.init();
  },
  mounted() {
    this.profilesData();
  },
  beforeRouteUpdate(_to, _from, next) {
    next();
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    this.loading = true;


    this.init();


  },
  methods: {
    getFormatInterests(interests) {
      if (interests.includes('[')) {
        return JSON.parse(interests).toString()
      } else if (!interests.includes('[') && typeof interests == 'string') {
        return interests;
      } else {
        return interests.join(',');
      }
    },
    init() {
      const params = {
        ident: {girlSiteId: Number(this.$route.params.account), type: this.$route.params.type} as IGirlIdent,
        payload: {manId: Number(this.$route.params.client)} as IManIdent,
        page: Number(this.$route.params.page)
      };

      this.controller = new AbortController();
      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/history-tab/' + JSON.stringify(params), {
        signal: this.controller.signal
      }).then((response: Body) => response.json())
        .then((result: TResponse) => {
          this.loading = false;
          this.controller = null;
          this.response = result;

        }).catch(() => {
      })
    },
    async profilesData() {
      await fetch('http://'
        + '777wt.net'
        + '/api/get-accounts-info/'
        + '?access_token=2h4_ZWu0thjwa3EycvCWmURt'
        + `&token=${this.$route.params.page}`
        + `&girl_site_id=${this.$route.params.account}`
        + `&man_site_id=${this.$route.params.client}`
        + `&topdates_type=${this.$route.params.type}`)
        .then(result => result.json())
        .then((result) => {
          this.profiles = result;
        }).catch((e) => {
          console.log(e)
        })
    },
    show() {
      this.visible = true
    },
    handleHide() {
      this.visible = false
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
          girlSiteId: Number(this.$route.params.account),
          type: this.$route.params.type
        } as unknown as IGirlIdent,
        payload: {
          manId: Number(this.$route.params.client),
          search: this.search,
          from,
          to
        } as unknown as IPayload
      };

      fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/history/' + JSON.stringify(params))
        .then((response: Body) => response.json())
        .then((result: TResponse) => {
          this.loading = false;
          this.messages = result.payload as any;
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
    },
    close() {
      this.imgSrc = '';
    },
    openPicture(message) {
      let result = message && message?.message.replace(
        'events/chat-image-updated?',
        'events/chat-image-updated?token=' + this.$route.params.page + '&'
      )
      if (result.includes('img') && !result.includes('stickers')) {
        this.imgSrc = result.slice(10, result.length - 4)

      }
    },
    compileMessage(message: any) {
      let result = message && message?.message.replace(
        'events/chat-image-updated?',
        'events/chat-image-updated?token=' + this.$route.params.page + '&'
      )
      if (message.letter) {
        result = '✉ ' + result + ' ✉'
      }
      return result
    },
    openPhoto(user) {
      if (user.type == 'girl') {
        this.$refs.lightbox['showImage'](user.index);
      } else {
        this.$refs.lightbox2['showImage'](user.index);
      }
    },
    photosLightboxData()  {
      const mediaPhoto = [] as any;
      for (const photo of this.profiles?.girl_info.photos ) {
        mediaPhoto.push({
          src: photo,
          thumb: photo
        }) ;
      }
      return mediaPhoto && mediaPhoto.length ? mediaPhoto : null;
    },
    photosLightboxDataMan()  {
      const mediaPhoto = [] as any;
      for (const photo of this.profiles?.man_info.photos  ) {
        mediaPhoto.push({
          src: photo,
          thumb: photo
        }) ;
      }
      return mediaPhoto && mediaPhoto.length ? mediaPhoto : null;
    },
  },
  fetch() {
    const params = {
      access_token: '2h4_ZWu0thjwa3EycvCWmUR',
      girl_site_id: {girlSiteId: Number(this.$route.params.account), type: this.$route.params.type} as IGirlIdent,
      man_site_id: {manId: Number(this.$route.params.client)} as IManIdent
    };
    // fetch('http://api/get-accounts-info?access_token=2h4_ZWu0thjwa3EycvCWmURt&girl_site_id=196337704&man_site_id=78765258731&topdates_type=D')

  }
})
</script>

<style scoped lang="scss">
.modal-about__content {
  overflow: visible;
}

p {
  margin: 0;
}

.fl-row {
  display: flex;
  flex-direction: row;
}

.js-space-around {
  justify-content: space-around;
}


.history-page {
  //max-width: 860px;
  //margin: auto;
  padding: 20px;

  .img {
    max-width: 99px;
  }

  .time-date-message {
    margin-top: 5px;
  }

  .content {
    b-tabs {
      display: flex;

      b-tab:nth-child(1) {
        width: 50%;
        height: 100vh;
        overflow: auto;
      }

      b-tab:nth-child(2),
      b-tab:nth-child(3),
      {
        width: 25%;
        margin: 0 1rem;
        height: 100vh;
        overflow: auto;

      }
    }

  }

}

.search-block {
  align-items: flex-end !important;

  .input-group {
    &:nth-child(1) {
      width: 100%;
      margin-right: 1rem;
    }

    &:nth-child(2) {
      //margin-top: 1rem;
      display: flex;
      align-items: center;
      width: auto;
    }
  }
}

.mx-datepicker-range {
  width: 193px;

}

.tabs-component-tab {
  list-style-type: none !important;
}

.history-account {
  display: inline-block;
  padding-top: 10px;
}

.history-contact {
  float: right;
  display: inline-block;
  padding-top: 10px;
  text-align: right;
}

.message-text {
  width: 100%
}

.messages-dialog {
  margin-bottom: 0;
}

.pagination {
  width: 100%;
}

.advanced-link-container {
  position: relative;

  .advanced-link {
    position: absolute;
    top: -15px;
    left: 40%;
  }
}

.history-tab {
  &__container {
    padding-bottom: 50px;
  }

  &__cover {
    width: 100%;
    height: 200px;
    position: relative;
  }

  &__ava {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    object-fit: cover;
    position: absolute;
    top: 50%;
    left: 40px;
    transform: translateY(-50%);
    border: 4px solid #fff;
  }

  &__name {
    font-size: 20px;
    margin-bottom: 0;

  }

  &__interests {
    span:nth-child(1) {
      font-size: 20px;
    }

    .label {
      border: 1px solid #0056b3;
      border-radius: 25px;
      margin-right: 10px;
      margin-bottom: 10px;
      padding: 4px;
      text-align: center;
      display: inline-flex;
    }
  }

  &__about {
    span {
      font-size: 20px;
    }
  }

  &__looking-for {
    span {
      font-size: 20px;
    }
  }

  &__gallery {

    span {
      font-size: 20px;
      margin-bottom: 5px;
    }

    div {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;

      img {
        margin-right: 20px;
        margin-bottom: 20px;
        width: 200px;
        cursor: pointer;
      }
    }

  }
}


</style>
