<template>
  <div class="account-panel">
    <span class="icon-close-dialog" @click="$emit('close')"></span>
    <div v-if="loading" class="loading">Loading...</div>
    <MailerPanel v-else-if="account && state" :user="user" :account="account" :templates="state.templates"></MailerPanel>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import {IIdent, IMailerTemplate} from '~/types/core';
  import MailerPanel from '~/components/panels/MailerPanel.vue'

  interface IState {
    templates: IMailerTemplate[]
  }

  export default Vue.extend({
    components: {MailerPanel},
    props: {
      user: Object,
      account: Object
    },
    data() {
      return {
        loading: false,
        state: null as IState | null
      }
    },
    watch: {
      account() {
        this.request()
      }
    },
    mounted() {
      this.request()
    },
    methods: {
      request() {
        if (this.loading) {
          return;
        }

        this.loading = true;
        const params = {
          ident: {
            userId: this.user.id,
            girlSiteId: this.account.id,
            type: this.account.type
          } as IIdent
        };

        fetch('http://' + (process.env.API_HOST || location.hostname + ':7777') + '/mailer-templates/' + JSON.stringify(params))
          .then((response: Body) => response.json())
          .then((result: IState) => {
            this.loading = false;
            if (result) {
              this.state = result
            }
          });
      },
    }
  })
</script>

<style scoped lang="scss">

  .account-panel {
    position: relative;
    .loading {
      margin-top: 20px;
      font-size: 13px;
      text-align: center;
    }
  }
</style>
