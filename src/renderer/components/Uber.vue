<template>
  <div class="d-flex h-100 w-100 flex-column">
    <header class="p-4 mb-auto">
      <img src="static/ride-receipts.svg" alt="Ride Receipts" width="253">
    </header>
    <main class="mt-5">
      <transition name="fade" mode="in-out">
        <section v-if="form === null" key="loading">
          <div class="loading">
            <div class="inner"></div>
          </div>
        </section>
        <section v-if="form === 'EMAIL'" key="email">
          <div class="row">
            <div class="col-8 mx-auto">
              <p class="sign-in-text text-center mb-5">Enter the email address associated with your Uber account</p>
            </div>
            <div class="col-8 mx-auto">
              <div class="form-group">
                <b-form-input id="email"
                v-model.trim="fields.email"
                type="text"
                :readonly="!emailError"
                :state="emailError"
                aria-describedby="email emailFeedback"
                placeholder="Email Address"></b-form-input>
                <b-form-invalid-feedback id="emailFeedback">
                  'Oops! There is no account associated with this email address.'
                </b-form-invalid-feedback>
              </div>
            </div>
          </div>
        </section>
        <section v-if="form === 'CAPTCHA'" key="captcha">
          <div class="row">
            <div class="col-8 mx-auto">
              <p class="sign-in-text text-center mb-5">Verifying your account. This takes approximately 1 minute.</p>
              <div class="loading">
                <div class="inner"></div>
              </div>
            </div>
          </div>
        </section>
        <section v-if="form === 'PASSWORD'" key="password">
          <div class="col-8 mx-auto">
            <p class="sign-in-text text-center mb-5">Enter the password for your Uber<br/>account <i id="user-password" class="far fa-2x fa-question-circle"></i></p>
          </div>
          <div class="col-8 mx-auto">
            <div class="form-group">
              <b-form-input
                id="password"
                v-model.trim="fields.password"
                type="password"
                :readonly="!passError"
                :state="passError"
                aria-describedby="password passwordFeeback"
                placeholder="Password">
              </b-form-input>
              <img class="password-lock" src="static/password-lock.svg">
              <b-form-invalid-feedback id="passwordFeedback">
                Oops! That is not the correct password. Unfortunately you will have to start again because the app does
                not store any information.
              </b-form-invalid-feedback>
            </div>
            <b-popover  ref="popover" target="user-password" triggers="click focus" placement="bottom">
               <template slot="title">Security</template>
               Ride Receipts is an automation app that tells the Chromium browser to download your receipts/invoices. This app has no database; therefore, it does not store your login credentials, personal information or any other data. It is as secure as logging into your Uber account through your browser.
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#security">Learn more</a></p>
            </b-popover>
          </div>
        </section>
        <section v-if="form === 'VERIFICATION'" key="verification">
          <div class="col-8 mx-auto">
            <p class="sign-in-text text-center mb-5">
              Enter the Uber verification code sent to you via SMS <i id="verification-code" class="far fa-2x fa-question-circle"></i>
            </p>
          </div>
          <div class="col-8 mx-auto">
            <div class="form-group">
              <b-popover ref="popover" target="verification-code" triggers="click focus" placement="bottom">
                 <template slot="title">Security</template>
                 Ride Receipts is an automation app that tells the Chromium browser to download your receipts/invoices. This app has no database; therefore, it does not store your login credentials, personal information or any other data. It is as secure as logging into your Uber account through your browser.
                 <br/>
                 <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#security">Learn more</a></p>
              </b-popover>
              <b-form-input
                id="verification"
                v-model.trim="fields.verification_code"
                type="text"
                size="4"
                :readonly="!veriError"
                :state="veriError"
                aria-describedby="verification verificationFeeback"
                placeholder="Verification code"></b-form-input>
                <b-form-invalid-feedback id="verificationFeedback">
                  Oops! That is not the correct verification code. Unfortunately you will have to start again because the app does not store any information.
                </b-form-invalid-feedback>
              </div>
          </div>
        </section>
        <section v-if="form === 'FILTER_OPTION'" key='filteroption'>
          <div class="row">
            <div class="col-9 mx-auto">
                <p class="sign-in-text text-center mb-5">Which receipts/invoices would you like to <br/> download? <i id="filter-option" class="far fa-2x fa-question-circle"></i></p>
                <b-popover ref="popover" target="filter-option" triggers="click" placement="bottom">
                   <template slot="title">Note</template>
                   Ride Receipts can only download the invoices and/or receipts that exist in your Uber account.
                   <br/>
                   <br/>
                   <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#limitations">Learn more</a></p>
                </b-popover>
            </div>
            <div class="col-7 mx-auto">
              <div class="form-group">
                <div class="row mx-auto">
                  <div class="col">
                    <div class="form-check">
                      <label class="form-check-label">
                        <input class="form-check-input" type="radio"  v-model="fields.filter_option" name="filter" value="previousyear">
                        Previous year
                      </label>
                    </div>
                    <div class="form-check">
                      <label class="form-check-label">
                        <input class="form-check-input" type="radio" v-model="fields.filter_option" name="filter" value="currentyear">
                        Current year
                      </label>
                    </div>
                  </div>
                  <div class="col">
                    <div class="form-check">
                      <label class="form-check-label">
                        <input class="form-check-input" type="radio" v-model="fields.filter_option" name="filter" value="lastthreemonths">
                        Last 3 months
                      </label>
                    </div>
                    <div class="form-check">
                      <label class="form-check-label">
                        <input class="form-check-input" type="radio" v-model="fields.filter_option" name="filter" value="lastmonth">
                        Last month
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section v-if="form === 'GENERATE_LINKS'" key='generatelinks'>
          <div class="row">
            <div class="col-8 mx-auto">
              <p class="sign-in-text text-center">Checking your Uber account for all receipts/invoices within the time frame you selected. This could take 10 mins or more.</p>
            </div>
            <div class="col-8 mx-auto">
              <div class="loading">
                <div class="inner"></div>
              </div>
            </div>
          </div>
        </section>
        <section v-if="form === 'INVOICE_COUNT'" key='invoicecount'>
          <div class="row">
            <div class="col-8 mx-auto">
              <p class="sign-in-text text-center">{{ downloadingMessage }}</p>
              <div class="progress">
                <div class="progress-bar" role="progressbar" :style="{ width: percent + '%' }" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </div>
        </section>
        <section v-if="form === 'DOWNLOADED'" key='downloaded'>
          <div class="row">
            <div class="col-8 mx-auto">
              <p class="sign-in-text mb-4 text-center" v-if="invoiceCount > 0">Success! All receipts have been downloaded for you.</p>
              <p class="sign-in-text mb-4 text-center" v-if="invoiceCount === 0">{{ downloadingMessage }}</p>
              <div v-if="invoiceCount > 0" class="card-deck mb-5">
                <div class="card">
                  <div class="card-body d-flex flex-row">
                    <img src="static/rideshare-car.svg" width="86" class="mr-4">
                    <p class="card-text">
                      Number of trips<br/>
                      <span class="trip-count">{{ invoiceCount }} trips</span>
                    </p>
                  </div>
                </div>
                <div class="card">
                  <div class="card-body">
                    <carousel :navigationEnabled="navigation" :paginationEnabled="pagination" :perPage="perPage">
                        <slide class="d-flex flex-row" v-for="rate in rates">
                          <img src="static/piggy-bank.svg" width="86" class="mr-4">
                          <p class="card-text">
                            Total spend<br/>
                            <span class="trip-count">{{ rate.currency }} {{ Number(rate.amount.reduce((a, b) => a + b, 0).toFixed(2)) }}</span>
                          </p>
                        </slide>
                    </carousel>
                  </div>
                </div>
              </div>
              <p v-if="invoiceCount > 0" class="text-center">
                <button type="button" @click.stop.prevent="openInvoiceFolder()" class="btn btn-lg btn-started" >View Receipts</button>
              </p>
              <p v-if="invoiceCount === 0" class="text-center">
                <router-link :to="{ name: 'main-page' }" class="btn btn-lg btn-started" tag="button">Start again</router-link>
              </p>
            </div>
          </div>
        </section>
        <section v-if="form === 'error-captcha'" key="errorcaptcha">
          <div class="row">
            <div class="col-8 mx-auto">
              <p class="sign-in-text text-center">Ride Receipts failed to verify your account. Please try again.</p>
            </div>
          </div>
        </section>
        <section v-if="form === 'CHROME_NOT_FOUND'" key="chomenotfound">
          <div class="row">
            <div class="col-10 mx-auto">
              <p class="sign-in-text text-center">
                It seems like you don't have Chromium installed. Please download it from <a class="js-external-link" href="https://download-chromium.appspot.com/">here</a>. Place the file on your desktop and unzip it.
             </p>
            </div>
          </div>
        </section>
      </transition>
    </main>
    <footer class="mt-auto p-4" v-if="form === 'INVOICE_COUNT'">
      <div class="row">
        <div class="col">
          <p class="progress-tip text-center pt-5"><i id="progress-tip" class="far fa-2x fa-question-circle"></i></p>
          <b-popover  ref="popover" target="progress-tip" triggers="click" placement="top">
             <template slot="title">Speed</template>
             We purposely check your account slowly to prevent the Uber website from knowing you are running a script.
             <br/>
             <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun#limitation">Learn more</a></p>
          </b-popover>
        </div>
      </div>
    </footer>
    <footer class="mt-auto contribution-box p-4" v-if="hideContribution">
      <div class="row">
        <div class="col-md-10 mx-auto">
          <p class="text-center mb-1">Did you find this app useful?</p>
          <p class="text-center">If so, please make a contribution so we can keep maintaining Ride Receipts.</p>
          <p class="text-center">👉 <a href="https://paypal.me/UberRun" class="ml-1 mr-1 js-external-link">Click here to contribute </a> 👈</p>
        </div>
      </div>
    </footer>
    <footer class="mt-auto p-4" v-if="hideNavigation">
      <div class="row" v-if="!disableButton">
        <div class="col">
          <router-link :to="{ name: 'main-page' }" tag="button" class="btn btn-outline-primary btn--submit back-btn float-left mt-3" v-if="!hideBackButton">
            <img class="arrow" src="static/back-arrow.svg">Back
          </router-link>
        </div>
        <div class="col" v-if="!hideButton">
            <button v-if="!errorButton" type="button" @click="submitForm" class="btn btn-outline-primary btn--submit float-right mt-3" >Next<img class="arrow" src="static/next-arrow.svg"></button>
            <button type="button" v-if="errorButton" @keyup.enter="startForm()" @click="startAgain()" class="btn btn-outline-primary btn--submit-start float-right mt-3">Start Again<img class="arrow" src="static/next-arrow.svg"></button>
        </div>
      </div>
    </footer>
    <footer class="mt-auto p-4" v-if="showBlank"></footer>
  </div>
</template>
<script>
import puppeteer from '../services/puppeteer'
import _ from 'lodash'

export default {
  data () {
    return {
      form: null,
      loading: false,
      fields: {
        email: null,
        password: null,
        verification_code: null,
        filter_option: null
      },
      invoiceCount: null,
      invoiceData: null,
      rates: [],
      online: true,
      emailError: true,
      passError: true,
      veriError: true,
      downloadingMessage: null,
      percent: null,
      downloaded: false,
      dir_cleanup: false,
      pagination: false,
      navigation: true,
      perPage: 1
    }
  },
  mounted () {
    this.startAgain()
    this.$electron.ipcRenderer.on('onlinestatus', (event, data) => {
      if (data === 'offline') {
        this.online = false
        this.emailError = false
        this.passError = false
        this.veriError = false
      } else {
        this.online = true
      }
    })
    this.$electron.ipcRenderer.on('form', (event, data) => {
      this.emailError = true
      this.passError = true
      this.veriError = true
      this.loading = false

      if (data === 'EMAIL') {
        this.fields = {
          email: null,
          password: null,
          verification_code: null,
          filter_option: null
        }
      }

      if (data === 'DOWNLOADED') {
        this.calculateAmountSpent()
        const notification = new Notification('Ride Receipts', {
          body: 'Success! All invoices have been downloaded for you.'
        })
        notification.onclick = () => {
          console.log('Notification clicked')
        }
      }

      if (data !== 'error-email' && data !== 'error-pass' && data !== 'error-veri') {
        this.form = data
      }

      if (data === 'error-email') {
        this.emailError = false
      }

      if (data === 'error-pass') {
        this.passError = false
      }

      if (data === 'error-veri') {
        this.veriError = false
      }
    })
    this.$electron.ipcRenderer.on('invoiceTotal', (event, data) => {
      this.invoiceCount = data.length
      this.invoiceData = data
      this.downloadMessage(data.length)
    })
    this.$electron.ipcRenderer.on('progress', (event, data) => {
      this.percent = data
    })
    this.$electron.ipcRenderer.on('dircleanup', (event, data) => {
      this.percent = null
      this.dir_cleanup = true
    })
  },
  computed: {
    showBlank () {
      if (this.form === null) {
        return true
      }

      return false
    },
    hideNavigation () {
      if (this.form === 'DOWNLOADED') {
        return false
      }

      if (this.form === 'INVOICE_COUNT') {
        return false
      }

      if (this.form === null) {
        return false
      }

      return true
    },
    hideContribution () {
      if (this.form === 'DOWNLOADED') {
        return true
      }
      return false
    },
    disableButton () {
      if (this.form === 'DOWNLOADED') {
        return true
      }
      if (this.form === 'GENERATE_LINKS') {
        return true
      }
      if (this.form === 'INVOICE_COUNT') {
        return true
      }
      if (this.form === 'CAPTCHA') {
        return true
      }
      if (!this.online) {
        return true
      }
      return false
    },
    hideBackButton () {
      if (this.form === 'EMAIL') {
        return false
      }
      return true
    },
    hideButton () {
      if (this.form === 'error-captcha') {
        return false
      }
      return false
    },
    errorButton () {
      if (!this.passError) {
        return true
      }
      if (!this.emailError) {
        return true
      }
      if (!this.veriError) {
        return true
      }
      if (this.form === 'ERROR') {
        return true
      }
      if (this.form === 'CHROME_NOT_FOUND') {
        return true
      }
      if (this.form === 'error-captcha') {
        return true
      }
      return false
    }
  },
  methods: {
    calculateAmountSpent () {
      this.invoiceData.forEach((value, i) => {
        const amount = Number(value.amount.replace(/[^0-9.]+/g, ''))
        const currency = value.amount.match(/[^\d.]/g).join('')
        const check = _.findIndex(this.rates, ['currency', currency])
        if (check < 0) {
          this.rates.push({
            currency: currency,
            amount: [amount]
          })
        } else {
          this.rates[check].amount.push(amount)
        }
      })
      if (this.rates.length === 1) {
        this.navigation = false
      } else {
        this.navigation = true
      }
    },
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
    startAgain () {
      this.loading = true
      puppeteer()
    },
    openInvoiceFolder () {
      const documentDir = this.$electronstore.get('invoicePath')
      this.$electron.shell.openItem(documentDir)
    },
    submitForm () {
      switch (this.form) {
        case 'EMAIL':
          this.$electron.ipcRenderer.send('email', this.fields.email)
          break
        case 'PASSWORD':
          this.$electron.ipcRenderer.send('password', this.fields.password)
          break
        case 'VERIFICATION':
          this.$electron.ipcRenderer.send('code', this.fields.verification_code)
          break
        case 'FILTER_OPTION':
          this.$electron.ipcRenderer.send('filter_option', this.fields.filter_option)
          break
      }
    }
  }
}
</script>
