import { createSSRApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import 'uview-plus/index.scss';
import { checkLogin, getCurrentRoute } from '@/utils/common';
// #ifndef VUE3
import Vue from 'vue';
Vue.prototype.$checkLogin = checkLogin;
Vue.prototype.$getCurrentRoute = getCurrentRoute;
const app = new Vue({
  ...App,
});

app.$mount();
// #endif

// #ifdef VUE3
export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.config.globalProperties.$checkLogin = checkLogin;
  app.config.globalProperties.$getCurrentRoute = getCurrentRoute;

  return {
    app,
  };
}
// #endif
