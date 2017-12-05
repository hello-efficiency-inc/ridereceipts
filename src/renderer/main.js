import Vue from 'vue'
import App from './App'
import router from './router'
import { remote } from 'electron'
import jetpack from 'fs-jetpack'

import './helpers/external_links.js'

const app = remote.app
const documentDir = jetpack.cwd(app.getPath('documents'))

if (!jetpack.exists(documentDir.path('Uber Invoice'))) {
  jetpack.dir(documentDir.path('Uber Invoice'))
}

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: {App},
  router,
  template: '<App/>'
}).$mount('#app')
