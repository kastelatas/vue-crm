<template>
  <div class="notifications-dropdown" v-if="active">
    <p class="title">Notifications</p>
    <div class="more-load">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="content">
      <Tabs>
        <Tab name="All" :selected="true">
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
          <div class="notification-block">
            <div class="more-load">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="avatar">
              <img src="/img/no-avatar.png" alt="">
            </div>
            <div class="notification-block__row">
              <p class="title"><span>Maxim Narvoyt</span> сегодня</p>
              <p class="text"><span>Назначил(а)</span> за вами Task “Разработать для копирайтера
                техническое окружение работ...</p>
            </div>
          </div>
        </Tab>
        <Tab name="New">

        </Tab>
        <Tab name="Tasks">

        </Tab>
        <Tab name="Mentionings">

        </Tab>
      </Tabs>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Tabs from '@/components/Tabs/Tabs.vue'
import Tab from '@/components/Tabs/Tab.vue'

export default Vue.extend({
  components: {Tabs, Tab},
  props: {
    active: {
      type: Boolean,
      required: true
    }
  }
})
</script>
