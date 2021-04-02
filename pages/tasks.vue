<template>
  <div class="tasks-page">
    <div class="tasks-page__header">
      <Tabs>
        <Tab name="All tasks" :selected="true"></Tab>
        <Tab name="ACD tasks"></Tab>
        <Tab name="Management tasks"></Tab>
      </Tabs>
      <div class="row">
        <div class="search-block">
          <input type="text" placeholder="Type into search..."/>
          <div class="search-loupe">
            <inline-svg src="/img/loupe.svg"/>
          </div>
        </div>
        <div class="new-task">
          <button><span>+</span> NEW TASKS</button>
        </div>
      </div>
    </div>
    <div class="tasks-page__content">
      <TasksList/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Tabs from '@/components/Tabs/Tabs.vue'
import Tab from '@/components/Tabs/Tab.vue'
import TasksList from '@/components/TasksList';

export default Vue.extend({
  components: {
    Tabs,
    Tab,
    TasksList
  },
  watch: {
    '$route'() {
      console.log(this.$route.hash)
    }
  }
})
</script>

<style scoped>

</style>
