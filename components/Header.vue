<template>
  <div class="header">
    <div class="header__row">
      <div class="notifications " :class="{'new_notifications' : false}" @click="showNotifications">
        <span class="notifications-icon" :class="{'notifications-icon__active' : active }" >
          <inline-svg src="/img/alarm.svg"/>
        </span>
      </div>
     <span class="delete-chats" @click="$ws.removeOfflineContacts()">
        <inline-svg src="/img/massage-delete.svg"/>
     </span>
      <div class="nav">
        <ul class="menu" @click="$emit('close')" ref="links">
          <router-link  exact :to="`/?key=${token}`">Chatroom</router-link>
<!--          <router-link  :to="`/tasks?key=${token}`">Tasks <span class="count-tasks"></span></router-link>-->
<!--          <router-link :to="`/achievements?key=${token}`">My achievements</router-link>-->
<!--          <router-link :to="`/rating?key=${token}`">ACD Rating</router-link>-->
        </ul>
      </div>
      <div class="right-block">
        <div class="mailers-block">
          <p class="text">Mailers launched: </p> &nbsp;
          <span class="count-mailers" v-if="$ws.store"> {{
              $ws.store.stat ? $ws.store.stat.activeMailers : ''
            }} / {{ $ws.store.chats && $ws.store.chats.length }}</span>
        </div>
<!--        <div class="theme-block">-->
<!--          <div class="switch-container">-->
<!--            <label class="switch">-->
<!--              <input type="checkbox" v-model="checkTheme" @change="changeTheme">-->
<!--              <span class="switch-slider round">-->
<!--              </span>-->
<!--            </label>-->
<!--          </div>-->
<!--        </div>-->
        <div class="operator-block">
          <button class="start-day" @click="$ws.startStop()">{{ $ws.store.state.started ? 'Stop' : 'Start' }}</button>
          <div class="operator-block__row" v-if="$ws.store.operator">
            <div>
              <p class="name"> {{ $ws.store.operator.name }}</p>
              <template v-if="$ws.store.state.started">
               <div class="timer">
                 <inline-svg src="/img/clock.svg"/>
                 <TimeTicker :time="$ws.store.state.workedTime"/>
               </div>
              </template>
            </div>
            <img :src="`${$ws.store.operator.avatar}&token=${token}`" alt="">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="operator-block__row" v-else>
            <input
              class="form-control"
              placeholder="Enter your ID"
              v-model="$ws.store.state.operatorId"
              @keypress.enter="$ws.startStop()"
            />

          </div>
          <div class="avatar">
            <img src="" alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TimeTicker from '~/components/TimeTicker.vue'
import Vue from 'vue'
export default Vue.extend({
  components: {
    TimeTicker
  },
  props: {
    operator: {
      type: Object
    },
    token: {
      type: String
    },
    active: {
      type: Boolean,
      required: true
    }
  },
  data(){
    return{
      isActive: this.active,
      checkTheme: false,
      activeLink: null
    }
  },
  mounted() {
    this.checkTheme = localStorage.getItem('theme') == 'dark';
    // console.log(typeof this.$refs.links)
    // for (const link in this.$refs.links) {
    //   console.log(typeof this.$refs.links[link])
    // }
  },
  methods: {
    // clickLink(){
    //   let $activeWidth, $defaultMarginLeft, $defaultPaddingLeft, $firstChild, $line, $navListItem;
    //
    //   $line = $('#line');
    //
    //   $navListItem = $('.nav-li');
    //
    //   $activeWidth = $('.active-nav').width();
    //
    //   $firstChild = $('.nav-li:first-child');
    //
    //   $defaultMarginLeft = parseInt($('.nav-li:first-child').next().css('marginLeft').replace(/\D/g, ''));
    //
    //   $defaultPaddingLeft = parseInt($('#nav-container > ul').css('padding-left').replace(/\D/g, ''));
    //
    //   $line.width($activeWidth + 'px');
    //
    //   $line.css('marginLeft', $defaultPaddingLeft + 'px');
    //
    //   $navListItem.click(function() {
    //     var $activeNav, $currentIndex, $currentOffset, $currentWidth, $initWidth, $marginLeftToSet, $this;
    //     $this = $(this);
    //     $activeNav = $('.active-nav');
    //     $currentWidth = $activeNav.width();
    //     $currentOffset = $activeNav.position().left;
    //     $currentIndex = $activeNav.index();
    //     $activeNav.removeClass('active-nav');
    //     $this.addClass('active-nav');
    //     if ($this.is($activeNav)) {
    //       return 0;
    //     } else {
    //       if ($this.index() > $currentIndex) {
    //         if ($activeNav.is($firstChild)) {
    //           $initWidth = $defaultMarginLeft + $this.width() + $this.position().left - $defaultPaddingLeft;
    //         } else {
    //           $initWidth = $this.position().left + $this.width() - $currentOffset;
    //         }
    //         $marginLeftToSet = $this.position().left + $defaultMarginLeft + 'px';
    //         $line.width($initWidth + 'px');
    //         return setTimeout(function() {
    //           $line.css('marginLeft', $marginLeftToSet);
    //           return $line.width($this.width() + 'px');
    //         }, 175);
    //       } else {
    //         if ($this.is($firstChild)) {
    //           $initWidth = $currentOffset - $defaultPaddingLeft + $defaultMarginLeft + $currentWidth;
    //           $marginLeftToSet = $this.position().left;
    //         } else {
    //           $initWidth = $currentWidth + $currentOffset - $this.position().left;
    //           $marginLeftToSet = $this.position().left + $defaultMarginLeft;
    //         }
    //         $line.css('marginLeft', $marginLeftToSet);
    //         $line.width($initWidth + 'px');
    //         return setTimeout(function() {
    //           return $line.width($this.width() + 'px');
    //         }, 175);
    //       }
    //     }
    //   });
    // },
    showNotifications(): void {
      this.$emit('handleShowNotification')
    },
    changeTheme() {
      if (this.checkTheme){
        document.body.setAttribute('class', 'dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.body.setAttribute('class', 'light')
        localStorage.setItem('theme', 'light')
      }

    },
  }

})
</script>

