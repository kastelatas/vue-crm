<template>
  <div class="modal-about">
    <div style="position:relative;">
    </div>
    <template v-if="!accountChat">
      <div class="drag-handle" style="width: 100%;height: 100%">
        <Loader/>
        <div class="close-icon" @click="hide">
          <inline-svg src="/img/close.svg"/>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="modal-about__header drag-handle">
        <div class="close-icon" @click="hide">
          <inline-svg src="/img/close.svg"/>
        </div>

        <div class="modal-row flex-md-row align-items-center"
             :class="{'active-type': accountChat.topdates_type !== 'D'}" style="margin-right: 40px;">
          <img v-if="accountChat.avatar" :src="accountChat.avatar" alt="" class="avatar"/>
          <img v-else src="/img/no-avatar.png" alt="" class="avatar"/>
          <div class="modal-row">
            <p class="name">{{ accountChat.name }} {{ accountChat.lastname }}</p>
            <p class="id">{{ accountChat.girl_site_id ? accountChat.girl_site_id : accountChat.man_site_id }}
              {{ accountChat.topdates_type }}</p>
          </div>


        </div>

        <div class="modal-row  align-items-md-start">
          <span v-if="accountChat.redirect.login" @click="copyData(accountChat, 'login')" class="copy_data">
            <inline-svg src="./img/cop_id.svg"/>
            copy login</span>
          <span v-if="accountChat.redirect.password" @click="copyData(accountChat, 'password')" class="copy_data">
            <inline-svg src="./img/cop_id.svg"/>
            copy password</span>
        </div>
        <span class="enter-site" v-if="accountChat.go_to_site_link"
              v-tooltip.bottom="{content:'Перейти в профиль на сайте-партнере', classes: 'icon-tooltip', delay:{show: 1500}}"
        >
          <a :href="accountChat.go_to_site_link" target="_blank"><inline-svg src="./img/enter.svg"/></a>
        </span>
      </div>

      <div class="modal-about__content">
        <div class="modal-row" v-if="accountChat.extra_information">
          <p class="title about">
            Information:
          </p>
          <p class="about-text">
            {{ accountChat.extra_information }}
          </p>
        </div>
        <div class="modal-row " v-if="accountChat.comment">
          <span class="rewrite-comment" @click="rewriteCommentShow(accountChat, accountResponse)">
            <inline-svg src="./img/edit.svg"/>
          </span>
          <div>
            <p class="title about">
              Comments:
            </p>
            <p class="about-text" v-if="!isRewriteComment">
              {{accountResponse && accountResponse.ident.girlSiteId == accountChat.girl_site_id ? replaceTexts(accountResponse.comment) : replaceTexts(accountChat.comment)}}
              {{ replaceTexts(accountChat.comment) }}
            </p>
          </div>
          <div class="flex-md-column" v-if="isRewriteComment">
            <textarea type="text" v-model="commentText" ref="commentText" rows="3" class="rewrite-textarea"/>
            <div>
              <button @click="rewriteComment(accountChat)">Send</button>
              <button @click="isRewriteComment = false">Cancel</button>
            </div>
          </div>
        </div>
        <div class="modal-row">
          <p class="title about">
            About:
          </p>
          <p class="about-text">
            {{ accountChat.character }}
          </p>
        </div>
        <div class="modal-row">
          <p class="title looking">
            Looking for:
          </p>
          <p class="looking-text" v-html="accountChat.mans_description">
          </p>
        </div>

        <div class="about-person__block">
          <div class="left-row">
            <div class="modal-row">
              <p class="title">Birthday:</p>
              <p class="text">{{ new Date(accountChat.birthdate).toLocaleDateString() }}
                <span style="color:#c0c3cc"> ({{ currentAge(accountChat.birthdate) }}) </span>
              </p>
            </div>
            <div class="modal-row">
              <p class="title">Weight:</p>
              <p class="text">{{ accountChat.weight }}</p>
            </div>
            <div class="modal-row">
              <p class="title">City:</p>
              <p class="text">{{ accountChat.city }}</p>
            </div>
            <div class="modal-row">
              <p class="title">Country:</p>
              <p class="text">{{ accountChat.country }}</p>
            </div>
            <div class="modal-row">
              <p class="title">Drink:</p>
              <p class="text">{{ accountChat.alcohol }}</p>
            </div>
            <div class="modal-row">
              <p class="title">Education:</p>
              <p class="text">{{ accountChat.education }}</p>
            </div>
          </div>
          <div class="right-row">

            <div class="modal-row">
              <p class="title">Eye:</p>
              <p class="text">{{ accountChat.eyes_color }}</p>
            </div>
            <div class="modal-row">
              <p class="title">Hair:</p>
              <p class="text">{{ accountChat.hair_color }}</p>
            </div>
            <div class="modal-row">
              <p class="title">Height:</p>
              <p class="text">{{ accountChat.height }}</p>
            </div>
            <div class="modal-row">
              <p class="title">Kids:</p>
              <p class="text">{{ accountChat.children }} </p>
            </div>
            <div class="modal-row">
              <p class="title">Occupation:</p>
              <p class="text">{{ accountChat.occupation }}</p>
            </div>
            <div class="modal-row">
              <p class="title">Relationship:</p>
              <p class="text">{{ accountChat.marital_status }}</p>
            </div>
            <div class="modal-row">
              <p class="title">Smoke</p>
              <p class="text">{{ accountChat.smoking }}</p>
            </div>
          </div>
        </div>
        <div class="interests-block">
          <p class="title">Interests:</p>
          <p class="text" v-if="accountChat.interests">
            {{ getFormatInterests(accountChat.interests) }}
          </p>
        </div>
        <div class="modal-row">
          <div class="gallery-block">
            <p class="title">Gallery</p>
            <div class="gallery-block__imgs">
              <div class="imgs" v-for="(photos, index) of accountChat.photos">
                <clazy-load :src="photos">
                  <img :src="photos" class="img" @click="showPhotosLightbox(index)">
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
</template>


<script>
import Vue from 'vue'
import Loader from '@/components/Loader.vue'
import {IIdent} from "@/types/core";

export default Vue.extend({
  props: {
    accountChat: {
      type: Object
    }
  },
  components: {Loader},
  data() {
    return {
      commentText: '',
      accountResponse: null,
      isRewriteComment: false
    }
  },
  methods: {
    replaceTexts(comments){
      return comments.replaceAll('/n', ' ')
    },
    rewriteCommentShow(accountChat, accountResponse = null) {
      console.log( accountResponse, accountChat)
      accountResponse && accountResponse.ident.girlSiteId === +accountChat.girl_site_id
        ? this.commentText = accountResponse.comment
        : this.commentText = accountChat.comment
      this.isRewriteComment = true
    },
    async rewriteComment(account) {
      this.commentText = this.commentText.replaceAll('"','\'');
      const params = {
        ident: {
          girlSiteId: +account.girl_site_id,
          type: account.topdates_type
        },
        comment: this.commentText
      };


      await fetch('http://'
        + process.env.API_HOST
        + '/update-girl-profile-comment/'
        + JSON.stringify(params)
        , {
        method: 'POST'
        })
        .then(result => result.json())
        .then((result) => {
          this.accountResponse = result
          this.isRewriteComment = false
        }).catch((e) => {
          console.log(e)
        })
    },
    copyData(account, type) {
      const el = document.createElement('textarea');
      el.value = type == 'login' ? account.redirect.login : account.redirect.password;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    },
    hide() {
      this.$emit('hideModal')
    },
    showPhotosLightbox(index) {
      this.$emit('showPhotosLightbox', index)
    },
    getFormatInterests(interests) {
      if (interests.includes('[')) {
        return JSON.parse(interests).toString()
      } else if (!interests.includes('[') && typeof interests == 'string') {
        return interests;
      } else {
        return interests.join(',');
      }
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

  },
  mounted() {

  },
  fetch() {

  }
})
</script>
