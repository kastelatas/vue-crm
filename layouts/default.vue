<template>
  <div>
    <div v-click-outside="close">
      <Header  :token="token" @handleShowNotification="handleShowNotification" @close="close" :active="active" />
      <NotificationDropdown :active="active" />
    </div>
    <nuxt />
  </div>
</template>


<script lang="ts">
import Vue from 'vue'
import Header from '@/components/Header.vue'
import NotificationDropdown from '@/components/notifications-dropdown.vue'
export default Vue.extend({
  components:{Header,NotificationDropdown},
  data(){
    return{
      token: '' as String | any,
      active: false
    }
  },
  methods:{
    handleShowNotification(){
      this.active = !this.active
    },
    close(){
      this.active = false
    }
  },
  created() {

  },
  mounted() {
    if (this.$route.path.includes('history')) {
      this.token = this.$route.params.page
    } else {
      this.token = this.$route.query.key
    }
    this.$ws.connect(this.token)
    // setInterval(() => {
    //   this.$ws.disconnect();
    //   this.$ws.connect(this.token)
    // }, 600000)
  },
})
</script>
