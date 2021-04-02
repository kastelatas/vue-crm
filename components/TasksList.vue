<template>
  <div class="tasks">
    <Task/>
    <Task/>
    <Task/>
    <Task/>
  </div>
</template>

<script>
import Vue from 'vue'
import Task from '@/components/Task';
export default Vue.extend({
  components:{Task}
})
</script>

<style scoped>

</style>
