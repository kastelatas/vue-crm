<template>
  <div class="presents-panel">
    <div class="messages-list" style="padding-top: 20px">
      <div v-for="present in state" class="messages-dialog" style="overflow: hidden; padding: 0">
        <div class="message-text messages-text_left">
          <p><small>{{ present.type }} #{{ present.accountId }} (from  #{{ present.clientId }})</small></p>
          <p v-html="present.message.text"></p>
          <div class="time-date-message">
            <span>{{ present.message.timestamp | time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    state: Array // as IPresent[]
  }
})
</script>
