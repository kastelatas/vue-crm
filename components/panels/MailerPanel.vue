<template>
  <div v-if="account" class="mailer-panel">
    <div class="mailer-panel-user">
      <div class="mailer-panel-user-person">
        <div class="mailer-panel-user-ava">
          <img v-if="account.avatar" :src="account.avatar + '&token='+$route.query.key" alt=""/>
          <img v-else src="/img/no-avatar.png" alt=""/>
        </div>
        <div class="mailer-panel-user-title">{{ account.name }}</div>
        <div class="mailer-panel-user-text">{{ account.id }}</div>
      </div>
      <div :class="{ show: isShowList }" class="mailer-panel-user-content">
        <div class="mailer-panel-user-dispatch-block">
          <div v-for="template in templates" v-tooltip.bottom="getTooltipHtml(template)" class="dispatch" @click="run(template)">
            <span>{{ getTemplateName(template) }}</span>
          </div>
        </div>
        <div>
          <div v-if="templates && templates.length > 3" class="mailer-panel-user-content-next" @click="toggleShowList">More</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue';
  import 'vue2-datepicker/index.css';
  import {VTooltip} from 'v-tooltip'
  import {IIdent, IMailerTemplate} from '~/types/core';

  Vue.directive('tooltip', VTooltip)

  export default Vue.extend({
    props: {
      user: Object, // as IUser
      account: Object, // as IChatAccount
      templates: Array // as IState
    },
    data() {
      return {
        isShowList: false
      }
    },
    methods: {
      toggleShowList() {
        this.isShowList = !this.isShowList
      },
      copyAccount() {
        const el = document.createElement('textarea');
        el.value = this.account.type + '#' + this.account.id;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      },
      getTooltipHtml(template: IMailerTemplate) {
        let html = ''
        const messages = this.getTemplateMessages(template)
        for (const i in messages) {
          html += '<div>' + messages[i] + '</div>'
        }
        return html
      },
      getTemplateName(template: IMailerTemplate) {
        let name = template.name
        if (!name) {
          const messages = this.getTemplateMessages(template)
          if (messages.length) {
            name = this.getTemplateMessages(template)[0]
          }
        }
        return name || '';
      },
      getTemplateMessages(template: IMailerTemplate): string[] {
        const res: string[] = []
        for (const [key, value] of Object.entries(template)) {
          if (/message/i.test(key) && value) {
            res.push(value)
          }
        }
        return res
      },
      run(template: IMailerTemplate) {
        const ident: IIdent = {
          userId: this.user.id,
          girlSiteId: this.account.id,
          type: this.account.type
        }
        const params = {
          ident,
          payload: {
            Id: template.id
          }
        };
        const url = 'http://' + (process.env.API_HOST || location.hostname + ':7777') + '/mailer-run/'
        fetch(url, {method: 'POST', body: JSON.stringify(params)}).then(() => {
          this.$emit('saved', ident.girlSiteId, ident.type);
        });
      }
    }
  })
</script>

<style scoped lang="scss">
  .mailer-panel {
    display: flex;
    flex-flow: column;
    /*padding: 0 10px;*/
   font-family: 'Geometria';

    &-btn-field {
      display: flex;
      width: 100%;
      justify-content: space-between;
      background-color: white;
      padding: 13px 10px;
      margin-bottom: 10px;
    }

    &-user {
      display: flex;
      border-top: 1px solid #ebecf2;
      padding: 11px;
      background-color: white;

      &-person {
        margin-right: 11px;
        max-width: 85px;
        text-align: center;
      }

      &-ava {
        width: 40px;
        height: 40px;
        margin: 0 auto 5px auto;

        > img {
          height: 100%;
          width: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
      }

      &-title {
        font-size: 14px;
        color: #4a4a4a;
      }

      &-text {
        color: #c0c3cc;
        font-size: 14px;
      }

      &-dispatch-block {
        height: 72px;
        overflow: hidden;
        transition: .3s ease;
      }

      &-content {
        width: 100%;
        display: flex;
        justify-content: space-between;
        flex-flow: column;
        max-width: calc(100% - 92px);

        &-next {
          cursor: pointer;
          text-transform: uppercase;
          color: #bec0cb;
          font-size: 10px;
          display: inline-flex;
          align-items: center;
          float: right;
          clear: right;

          &:after {
            margin-left: 2px;
            content: '';
            display: block;
            background-size: 8px;
            height: 8px;
            width: 8px;
            background-image: url("data:image/svg+xml,%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='96.154px' height='96.154px' viewBox='0 0 96.154 96.154' style='enable-background:new 0 0 96.154 96.154;' xml:space='preserve' fill='%23bec0cb'%3E%3Cg%3E%3Cpath d='M0.561,20.971l45.951,57.605c0.76,0.951,2.367,0.951,3.127,0l45.956-57.609c0.547-0.689,0.709-1.716,0.414-2.61 c-0.061-0.187-0.129-0.33-0.186-0.437c-0.351-0.65-1.025-1.056-1.765-1.056H2.093c-0.736,0-1.414,0.405-1.762,1.056 c-0.059,0.109-0.127,0.253-0.184,0.426C-0.15,19.251,0.011,20.28,0.561,20.971z'/%3E%3C/g%3E%3C/svg%3E%0A");
          }
        }

        &.show {
          .mailer-panel-user-content-next {
            &:after {
              transform: rotateX(180deg) translate(0px, 1px);
            }
          }

          .mailer-panel-user-dispatch-block {
            height: auto;
          }
        }
      }
    }

    .dispatch {
      font-size: 14px;
      font-weight: 500;
      padding: 2px 13px 1px 13px;
      color: #bec0cb;
      cursor: pointer;
      text-align: center;
      min-width: 0;
      flex-shrink: 1;
      flex-grow: 1;

      > span {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        line-height: 1;
      }

      &:hover {
        background-color: #53d98c;
        color: white;
      }

      &-active {
        background-color: #ebecf2;
        color: #4a4a4a;;
      }
    }

    .ch-tooltip-wrapper {

      &:hover {
        .ch-tooltip-body {
          display: block;
        }
      }
    }

    .ch-tooltip-body {
      position: absolute;
      display: none;
      bottom: 57%;
      height: 0;
    }
  }

</style>
