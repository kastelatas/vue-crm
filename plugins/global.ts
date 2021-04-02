import Vue from 'vue'
import VModal from 'vue-js-modal'
import VueDraggableResizable from 'vue-draggable-resizable'
import VueClazyLoad from 'vue-clazy-load';
import InlineSvg from 'vue-inline-svg';
import VueLazyLoad from 'vue-lazyload'
import LightBox from 'vue-image-lightbox'
import {Tabs, Tab} from 'vue-tabs-component';
import $ws from './ws'
// import 'vue-image-lightbox/dist/vue-image-lightbox.min.css'

Vue.use(VModal, { dynamic: true, dynamicDefaults: { clickToClose: true } });
Vue.use(VueClazyLoad);
Vue.use(VueLazyLoad)

Vue.component('vue-draggable-resizable', VueDraggableResizable);
Vue.component('inline-svg', InlineSvg);
Vue.component('light-box', LightBox);


Vue.component('tabs', Tabs);
Vue.component('tab', Tab);


export default function Core() {
  Vue.prototype.$ws = $ws;
}

Vue.use(Core);
