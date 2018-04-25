<template>
  <div>
    <form v-on:submit.prevent="submitForm" class="wrapper">
      <nav class="navbar navbar-light bg-transparent">
        <div class="navbar-brand">
          <img src="static/ride-receipts.svg" alt="Ride Receipts" width="253">
        </div>
      </nav>
      <transition name="fade">
        <div class="jumbotron form--container" v-if="form === 'LOGIN_FORM'">
          <div class="form-group">
            <br/>
            <label>
              Sign in to any of account below to automatically download and organize your Lyft receipts. <i id="privacy" class="far fa-2x fa-question-circle"></i>
            </label>
            <p class="text-center"><button type="button" @click="signIn('google')" class="btn btn-lg btn-started" v-if="!loading">Sign In to Gmail</button></p>
            <p class="text-center"><button type="button" @click="signIn('outlook')" class="btn btn-lg btn-started" v-if="!loading">Sign In to Outlook</button></p>
            <div class="loading" v-if="loading">
              <div class="inner"></div>
            </div>
          </div>
          <b-popover  ref="popover" target="privacy" triggers="click focus" placement="bottom">
             <template slot="title">Privacy</template>
             Ride Receipts is an automation app that has no database; therefore, it does not store your login credentials, personal information or any other data. Once you log in, we’ll fetch your Lyft receipts and auto-generate PDFs for you.
             <br/>
             <p class="text-right"><a class="js-external-link" href="https://ridereceipts.io/privacy">Learn more</a></p>
          </b-popover>
        </div>
        <div class="jumbotron form--container" v-if="form === 'FILTER_OPTION'" key="filteroption">
          <div class="form-group">
            <label>Which receipts would you like to <br/> download?</label>
            <div class="row">
              <div class="col">
                <div class="form-check">
                  <label class="form-check-label">
                    <input class="form-check-input" type="radio"  v-model="filter_option" name="filter" value="previousyear">
                    Previous year
                  </label>
                </div>
                <div class="form-check">
                  <label class="form-check-label">
                    <input class="form-check-input" type="radio" v-model="filter_option" name="filter" value="currentyear">
                    Current year
                  </label>
                </div>
              </div>
              <div class="col">
                <div class="form-check">
                  <label class="form-check-label">
                    <input class="form-check-input" type="radio" v-model="filter_option" name="filter" value="lastthreemonths">
                    Last 3 months
                  </label>
                </div>
                <div class="form-check">
                  <label class="form-check-label">
                    <input class="form-check-input" type="radio" v-model="filter_option" name="filter" value="lastmonth">
                    Last month
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'INVOICE_COUNT'" key="invoicecounts">
          <div class="form-group">
            <label>{{ downloadingMessage }}</label>
            <br/>
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'DOWNLOADED'" key="downloaded">
          <div class="form-group">
            <br/>
            <br/>
            <label v-if="invoiceCount > 0">Success! All invoices have been<br/> downloaded for you.</label>
            <p v-if="invoiceCount > 0" class="text-center">
              <button type="button" @click.stop.prevent="openInvoiceFolder()" class="btn btn-lg btn-started">View Receipts</button>
            </p>
            <label v-if="invoiceCount === 0">{{ downloadingMessage }}</label>
            <p v-if="invoiceCount === 0" class="text-center">
              <router-link :to="{ name: 'main-page' }" class="btn btn-lg btn-started" tag="button">Start again</router-link>
            </p>
            <div class="donation-msg mx-auto">
              <p class="text-center">Did you find this app useful? If so, please make a contribution so we can keep maintaining Ride Receipts.</p>
              <p class="text-center"><a href="https://paypal.me/UberRun" class="js-external-link">Click here to contribute</a></p>
            </div>
          </div>
        </div>
      </transition>
      <div class="submit-container">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12">
              <div class="continue-btn float-left" v-if="!hideBackButton">
                <router-link :to="{ name: 'main-page' }" tag="button" class="btn btn-outline-primary btn--submit back-btn">
                  <img class="arrow" src="static/back-arrow.svg">Back
                </router-link>
              </div>
              <div class="continue-btn float-right" v-if="!hideButton">
                <button type="submit" class="btn btn-outline-primary btn--submit">Next<img class="arrow" src="static/next-arrow.svg"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import {parse} from 'url'
import oauth from '../services/oauth'
import moment from 'moment-timezone'
import puppeteerLyft from '../services/puppeteer_lyft'
import axios from 'axios'
import _ from 'lodash'

export default {
  data () {
    return {
      form: 'LOGIN_FORM',
      filter_option: null,
      loading: false,
      downloadingMessage: null,
      invoiceCount: 0,
      progress: ''
    }
  },
  computed: {
    hideBackButton () {
      if (this.form === 'INVOICE_COUNT') {
        return true
      }
      if (this.form === 'FILTER_OPTION') {
        return true
      }
      if (this.form === 'DOWNLOADED') {
        return true
      }
    },
    hideButton () {
      if (this.form === 'LOGIN_FORM') {
        return true
      }
      if (this.form === 'INVOICE_COUNT') {
        return true
      }
      if (this.form === 'DOWNLOADED') {
        return true
      }
    }
  },
  methods: {
    downloadMessage (count) {
      if (count > 76) {
        this.downloadingMessage = `Wow this could take a while! Let Ride Receipts do its thing and we'll let you know once your ${count} trips are in order.`
      } else if (count > 56 && count <= 76) {
        this.downloadingMessage = `Whoa ${count} trips! Put your feet up and relax. This will take a while, my friend.`
      } else if (count > 46 && count <= 56) {
        this.downloadingMessage = `You have ${count} trips. Give the little robot some time to download and organize them for you.`
      } else if (count > 36 && count <= 46) {
        this.downloadingMessage = `Whoa someone's been busy! You have ${count} trips. Downloading now.`
      } else if (count > 26 && count <= 36) {
        this.downloadingMessage = `You have ${count} trips. Downloading and organizing them for you now. Sweet deal, huh?`
      } else if (count > 11 && count <= 26) {
        this.downloadingMessage = `You have ${count} trips. Pour yourself a drink and relax. We got this.`
      } else if (count > 6 && count <= 11) {
        this.downloadingMessage = `You have ${count} trips! This should download fairly quickly.`
      } else if (count > 1 && count <= 6) {
        this.downloadingMessage = `Running this app for just ${count} trips?\nThat's okay, we won't judge ;)`
      } else if (count === 1) {
        this.downloadingMessage = `Running this app for just ${count} trip?\nThat's okay, we won't judge ;)`
      } else {
        this.form = 'DOWNLOADED'
        this.downloadingMessage = `You have 0 trips within the time frame you selected.`
      }
    },
    signInWithPopup (provider) {
      return new Promise((resolve, reject) => {
        const authWindow = new this.$electron.remote.BrowserWindow({
          width: 500,
          height: 600,
          show: true
        })

        const authUrl = oauth.buildAuthUrl(provider)

        function handleNavigation (url) {
          const query = parse(url, true).query
          if (query) {
            if (query.error) {
              authWindow.removeAllListeners('closed')
              setImmediate(() => authWindow.close())
              resolve(false)
            } else if (query.code) {
              authWindow.removeAllListeners('closed')
              setImmediate(() => authWindow.close())
              resolve(query.code)
            }
          }
        }

        authWindow.on('closed', () => {
          resolve(false)
          throw new Error('Auth window was closed by user')
        })

        authWindow.webContents.on('will-navigate', (event, url) => {
          handleNavigation(url)
        })

        authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
          handleNavigation(newUrl)
        })

        authWindow.loadURL(authUrl)
      })
    },
    async signIn (provider) {
      this.loading = true
      let token
      const code = await this.signInWithPopup(provider)
      if (code) {
        token = await oauth.fetchToken(provider, code)
        alert(token)
      } else {
        this.loading = false
      }

      if (token) {
        const profile = await oauth.fetchGoogleProfile(provider, token.access_token)
        this.loading = false
        localStorage.setItem('token_data', JSON.stringify(token))
        localStorage.setItem('user_data', JSON.stringify(profile))
        this.form = 'FILTER_OPTION'
      }
    },
    async submitForm () {
      let startDate, endDate

      const user = JSON.parse(localStorage.getItem('user_data'))
      let messages
      const self = this

      if (this.filter_option === 'currentyear') {
        startDate = moment().startOf('year').format('X')
        endDate = moment().endOf('year').format('X')
      } else if (this.filter_option === 'previousyear') {
        startDate = moment().subtract(1, 'years').startOf('year').format('X')
        endDate = moment().subtract(1, 'years').endOf('year').format('X')
      } else if (this.filter_option === 'lastmonth') {
        startDate = moment().subtract(1, 'month').startOf('month').format('X')
        endDate = moment().startOf('month').format('X')
      } else if (this.filter_option === 'lastthreemonths') {
        startDate = moment().subtract(3, 'month').startOf('month').format('X')
        endDate = moment().startOf('month').format('X')
      }

      const list = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages?q='from:"Lyft Ride Receipt" after:${startDate} before:${endDate}'`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token_data')).access_token}`
        }
      })

      if (list.data.resultSizeEstimate === 0) {
        this.invoiceCount = 0
        this.downloadMessage(0)
        self.form = 'DOWNLOADED'
      } else {
        this.downloadMessage(list.data.messages.length)
        messages = list.data.messages
        this.invoiceCount = messages.length

        if (messages.length > 0) {
          this.form = 'INVOICE_COUNT'
        }

        if (typeof messages !== 'undefined') {
          messages.forEach(async function (value, i) {
            const data = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${value.id}`, {
              headers: {
                'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token_data')).access_token}`
              }
            })

            const header = data.data.payload.headers.map((item) => {
              let obj = {}
              obj[item.name] = item.value
              return obj
            })
            const html = Buffer.from(data.data.payload.body.data, 'base64')
            const date = new Date(parseInt(data.data.internalDate))
            puppeteerLyft(
              user.email,
              Object.assign({}, ...header),
              moment(date).format('YYYY'),
              moment(date).format('MMMM'),
              moment(date).format('MMMM-DD-YYYY_hh-mm-a'),
              html.toString()
            )
            self.progress = _.divide(i + 1, messages.length) * 100

            if (self.progress === 100) {
              self.form = 'DOWNLOADED'
            }
          })
        }
      }
    },
    openInvoiceFolder () {
      const documentDir = this.$electronstore.get('invoicePath')
      this.$electron.shell.openItem(documentDir)
    }
  }
}
</script>
