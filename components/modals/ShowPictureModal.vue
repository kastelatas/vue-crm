<template>
  <div class="show-picture" :class="{
    'hide': !imgSrc
  }">
   <div class="img-block">
      <span class="close" @click="close">
      <inline-svg src="/img/close.svg" />
    </span>
     <img :src="imgSrc" alt=""  >
   </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    img: {
      type: String,
      required: true
    }
  },
  data(){
    return {
      imgSrc: this.img  as any
    }
  },
  methods:{
    close(){
      console.log(1)
      this.$emit('close')
    }
  }
})
</script>


<style scoped lang="scss">

.show-picture {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  z-index: 600;

  &:after {
    content: '';
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
  }

  .img-block {
    position: relative;
  }

  .close {
    position: absolute;
    z-index: 20;
    top: -27px;
    right: -22px;
    cursor: pointer;
    svg {
      width: 20px;
      height: 20px;
      fill:#fff !important;
    }
  }

  img {
    width: auto;
    height: auto;
    position: relative;
    z-index: 3;
  }
}
.hide {
  display: none;
}

</style>
