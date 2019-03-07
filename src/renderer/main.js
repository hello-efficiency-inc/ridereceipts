import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import { remote } from 'electron'
import jetpack from 'fs-jetpack'
import ElectronStore from 'electron-store'
import VueCarousel from 'vue-carousel'

import './helpers/external_links.js'
import store from './store'

Vue.use(BootstrapVue)
Vue.use(VueCarousel)
const app = remote.app
const documentDir = jetpack.cwd(app.getPath('documents'))

if (!jetpack.exists(documentDir.path('Ride Receipts'))) {
  jetpack.dir(documentDir.path('Ride Receipts'))
}

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

const electronstore = new ElectronStore()

Vue.prototype.$electronstore = electronstore

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
