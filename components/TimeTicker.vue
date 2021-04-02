<template>
  <div>
    <vue-time-ticker :value="formattedTime" format="HOURS" />
  </div>
</template>

<script lang ="ts">
import Vue from 'vue';
// @ts-ignore
import VueTimeTicker from 'vue-time-ticker';

export default Vue.extend({
  name: 'Counter',
  components: { VueTimeTicker },
  props: {
    time: Number
  },
  computed: {
    formattedTime() {
      return new Date(this.time * 1000).toString();
    }
  }
});
</script>

<style scoped>

</style>
