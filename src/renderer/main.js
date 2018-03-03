import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import { remote } from 'electron'
import jetpack from 'fs-jetpack'
import Store from 'electron-store'

import './helpers/external_links.js'

Vue.use(BootstrapVue)
const app = remote.app
const documentDir = jetpack.cwd(app.getPath('documents'))

if (!jetpack.exists(documentDir.path('Uber Run'))) {
  jetpack.dir(documentDir.path('Uber Run'))
}

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

const store = new Store()

Vue.prototype.$electronstore = store

/* eslint-disable no-new */
new Vue({
  components: {App},
  router,
  template: '<App/>'
}).$mount('#app')
