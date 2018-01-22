<template>
  <div>
    <transition name="fade">
      <div class="splash" v-if="form === null">
        <div class="wrap-content">
          <img id="logo" src="static/uber-run.svg" alt="Uber Run">
          <p>Download your Uber invoices automatically.</p>
          <br/>
          <p><button type="button" @click="startAgain" v-if="!loading" class="btn btn-lg btn-started" :disabled="!online">Get Started</button></p>
          <p class="offline" v-if="!online">You are currently offline. Please get online in order to use this app</p>
          <div class="loading" v-if="loading">
            <div class="inner"></div>
          </div>
        </div>
      </div>
    </transition>
    <form v-on:submit.prevent="submitForm" class="wrapper" v-if="form !== null">
      <nav class="navbar navbar-light bg-transparent">
        <div class="navbar-brand">
          <img src="static/uber-run.svg" alt="Uber Run" width="100">
        </div>
      </nav>
      <transition name="fade">
        <div class="jumbotron form--container" v-if="form === 'EMAIL'" key="email">
          <div class="form-group">
            <label for="email">Enter the email address associated with your Uber account</label>
            <b-form-input id="email"
            v-model.trim="fields.email"
            type="email"
            :readonly="!emailError"
            :state="emailError"
            aria-describedby="email emailFeeback"
            placeholder="Email Address"></b-form-input>
            <b-form-invalid-feedback id="emailFeedback">
              Oops! There is no account associated with this email address.
            </b-form-invalid-feedback>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'PASSWORD'" key="password">
          <div class="form-group">
            <label for="password">Enter the password for your Uber<br/>account <i id="user-password" class="far fa-2x fa-question-circle"></i></label>
            <b-popover target="user-password" triggers="click" placement="bottom">
               <template slot="title">Security</template>
               Uber Run is an automation app that tells the Chromium browser to download your invoices. This app has no database; therefore, it does not store your login credentials, personal information or any other data. It is as secure as logging into your Uber account through your browser.
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun">Learn more</a></p>
            </b-popover>
            <b-input-group>
            <b-form-input
            id="password"
            v-model.trim="fields.password"
            type="password"
            :readonly="!passError"
            :state="passError"
            aria-describedby="password passwordFeeback"
            placeholder="Password"></b-form-input>
            <b-input-group-button slot="right">
              <img class="password-lock" src="static/password-lock.svg">
            </b-input-group-button>
           </b-input-group>
            <b-form-invalid-feedback id="passwordFeedback">
              Oops! That is not the correct password. Unfortunately you will have to start again.
            </b-form-invalid-feedback>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'VERIFICATION'" key="verification">
          <div class="form-group">
            <label for="verification">Enter the Uber verification code sent to you via SMS <i id="verification-code" class="far fa-2x fa-question-circle"></i></label>
            <b-popover target="verification-code" triggers="click" placement="bottom">
               <template slot="title">Security</template>
               Uber Run is an automation app that tells the Chromium browser to download your invoices. This app has no database; therefore, it does not store your login credentials, personal information or any other data. It is as secure as logging into your Uber account through your browser.
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun">Learn more</a></p>
            </b-popover>
            <input type="text" class="form-control form-control-lg" id="verification" v-model="fields.verification_code" aria-describedby="verification" placeholder="Verification code">
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'FILTER_OPTION'" key="filteroption">
          <div class="form-group">
            <label>Which invoices would you like to <br/> download ? <i id="filter-option" class="far fa-2x fa-question-circle"></i></label>
            <b-popover target="filter-option" triggers="click" placement="bottom">
               <template slot="title">Note</template>
               Uber Run can only download the invoices that exist in your Uber account. Invoices that have not been issued, or have a “Request Invoice” button (as in Uber Eats) will not be included.
               <br/>
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun">Learn more</a></p>
            </b-popover>
            <div class="row">
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
        <div class="jumbotron form--container" v-if="form === 'GENERATE_LINKS'" key="generatelinks">
          <div class="form-group">
            <label>Checking your Uber account for all available invoices within the time frame you selected. Please wait.</label>
            <br/>
            <div class="loading">
              <div class="inner"></div>
            </div>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'INVOICE_COUNT'" key="invoicecounts">
          <div class="form-group">
            <label>{{ downloadingMessage }}</label>
            <br/>
            <div class="progress" style="height: 30px;">
              <div class="progress-bar" role="progressbar" :style="{ width: percent + '%' }" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <p class="progress-tip text-center"><i id="progress-tip" class="far fa-2x fa-question-circle"></i></p>
            <b-popover target="progress-tip" triggers="hover focus" placement="top">
               <template slot="title">Speed</template>
               We purposely download the invoices slowly to prevent the Uber website from knowing you are running a script.
               <br/>
               <p class="text-right"><a class="js-external-link" href="https://github.com/mrgodhani/uberrun">Learn more</a></p>
            </b-popover>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'DOWNLOADED'" key="downloaded">
          <div class="form-group">
            <label v-if="invoiceCount > 0">Success! All invoices have been<br/> downloaded for you.</label>
            <p v-if="invoiceCount > 0" class="text-center"><button type="button" @click.stop.prevent="openInvoiceFolder()" class="btn btn-lg btn-started">View Invoices</button></p>
            <label v-if="invoiceCount === 0">{{ downloadingMessage }}</label>
            <p v-if="invoiceCount === 0" class="text-center"><button type="button" @click.stop.prevent="startAgain()" class="btn btn-lg btn-started">Start Again</button></p>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'ERROR'" key="error">
          <div class="form-group">
            <label>Oops seems like your IP Address is banned temporary. Please try again later.</label>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'CHROME_NOT_FOUND'" key="chromenotfound">
          <div class="form-group">
            <label>
              Oops! seems like you don't have chromium installed. Please download it from
              <a class="js-external-link" href="https://download-chromium.appspot.com/">here</a> and place the extracted folder on your desktop.
            </label>
          </div>
        </div>
      </transition>
      <div class="submit-container" v-if="!disableButton">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <div class="continue-btn float-right">
                <button type="submit" v-if="!errorButton" class="btn btn-outline-primary btn--submit">Next<img class="arrow" src="static/next-arrow.svg"></button>
                <button type="button" v-if="errorButton" @keyup.enter="startForm()" @click="startAgain()" class="btn btn-outline-primary btn--submit-start">Start Again<img class="arrow" src="static/next-arrow.svg"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import puppeteer from '../services/puppeteer'
import jetpack from 'fs-jetpack'

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
      online: true,
      emailError: true,
      passError: true,
      downloadingMessage: null,
      percent: null,
      downloaded: false,
      dir_cleanup: false
    }
  },
  mounted () {
    this.$electron.ipcRenderer.on('onlinestatus', (event, data) => {
      if (data === 'offline') {
        this.online = false
        this.emailError = false
        this.passError = false
      } else {
        this.online = true
      }
    })
    this.$electron.ipcRenderer.on('form', (event, data) => {
      this.emailError = true
      this.passError = true
      this.loading = false
      if (data !== 'error-email' && data !== 'error-pass') {
        this.form = data
      }

      if (data === 'error-email') {
        this.emailError = false
      }

      if (data === 'error-pass') {
        this.passError = false
      }
    })
    this.$electron.ipcRenderer.on('invoiceTotal', (event, data) => {
      this.invoiceCount = data
      this.downloadMessage(data)
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
      if (!this.online) {
        return true
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
      if (this.form === 'ERROR') {
        return true
      }
      if (this.form === 'CHROME_NOT_FOUND') {
        return true
      }
      return false
    }
  },
  methods: {
    downloadMessage (count) {
      if (count > 76) {
        this.downloadingMessage = `Wow this could take a while! Let Uber Run do its thing and we'll let you know once your ${count} invoices are in order.`
      } else if (count > 56 && count <= 76) {
        this.downloadingMessage = `Whoa ${count} invoices! Put your feet up and relax. This will take a while, my friend.`
      } else if (count > 46 && count <= 56) {
        this.downloadingMessage = `You have ${count} invoices. Give the little robot some time to download and organize them for you.`
      } else if (count > 36 && count <= 46) {
        this.downloadingMessage = `Whoa someone's been busy! You have ${count} invoices. Downloading now.`
      } else if (count > 26 && count <= 36) {
        this.downloadingMessage = `You have ${count} invoices. Downloading and organizing them for you now. Sweet deal, huh?`
      } else if (count > 16 && count <= 26) {
        this.downloadingMessage = `You have ${count} invoices. Pour yourself a drink and relax. We got this.`
      } else if (count > 11 && count <= 16) {
        this.downloadingMessage = `You have ${count} invoices!\nRun, Uber Run!`
      } else if (count > 6 && count <= 11) {
        this.downloadingMessage = `You have ${count} invoices! This should download fairly quickly.`
      } else if (count > 1 && count <= 6) {
        this.downloadingMessage = `Running this app for just ${count} invoices?\nThat's okay, we won't judge ;)`
      } else if (count === 1) {
        this.downloadingMessage = `Running this app for just ${count} invoice?\nThat's okay, we won't judge ;)`
      } else {
        this.form = 'DOWNLOADED'
        this.downloadingMessage = `You have 0 invoices within the time frame you selected.`
      }
    },
    startAgain () {
      this.loading = true
      puppeteer()
      this.fields = {}
    },
    openInvoiceFolder () {
      const documentDir = jetpack.cwd(this.$electron.remote.app.getPath('documents'))
      this.$electron.shell.openItem(documentDir.path('Uber Run'))
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
<style lang="scss" scoped>

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0
}

.password-lock {
  position: absolute;
  top: 20px;
  right: 0px;
}

.splash {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;

  .wrap-content {
    width: 360px;
  }

  img {
    height: 180px;
    margin-bottom: 40px;
  }

  p.offline {
    font-size: 20px;
    color: red;
  }

  p {
    font-size: 20px;
    line-height: 26px;
    color: #0A11BA;
  }
}

.btn-started {
  background: #d800d0;
  color: white;
  border-radius: 30px;
  width: 162px;
  height: 52px;
  text-transform: uppercase;
  font-size: 15px;
  font-weight: 700;

  &:hover:enabled {
    background: #0012B9;
    color: white;
  }
}

.bg-transparent {
  background: transparent;
}

.submit-container {
  position: absolute;
  width: 100%;
  bottom: 0;
  height: 100px;
  padding-top: 10px;
}

.form--container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  min-height: 70vh;
  padding: 3.5rem 8rem;

  label:not(.form-check-label) {
    font-size: 36px;
    text-align: center;
    font-weight: 800;
    margin-bottom: 35px;
    line-height: 42px;
    color: black;
  }

  .form-check-label {
    display: block;
    margin-bottom: 10px;
    font-size: 24px;
    line-height: 32px;
    color: black;
    padding-left: 15px;
  }

  input[type="radio"] {
    left: 20px;
    top: 3px;
  }

  input {
    padding-left: 0;
    outline: none;
    border: none;
    border-bottom: 2px solid rgba(0, 0, 0, 02);
    background-color: transparent;
    border-radius: 0px;
    font-size: 2em;
    color: black;
    caret-color: #0012B9;
    text-overflow: ellipsis;
    transition: all 0.5s ease;

    &:focus {
      border-image:  linear-gradient(to right, rgba(0,41,221,1) 0%, rgba(215,1,208,1) 100%);
      border-image-slice: 1;
      box-shadow: none;
      background: none;
      outline: none;
    }
  }

  p.invoice-link {
    font-size: 1.5em;
  }
}

.progress {
  border-radius: 1rem;
}

.progress-bar {
  background: linear-gradient(to right, rgba(0,41,221,1) 0%, rgba(215,1,208,1) 100%);
}

.continue-btn {
  button {
    cursor: pointer;
  }
  p {
    margin-top: 5px;
  }

  .btn--submit-start {
    position: absolute;
    font-size: 24px;
    right: 10px;
    /* Rounded button: */
    background: #FFFFFF;
    border-radius: 100px;
    height: 52px;
    padding-left: 20px;
    padding-right: 20px;
    border: 0px;
    font-weight: 800;
    color: black;
    text-transform: uppercase;

    &:hover {
      box-shadow: 1px 1px 4px 2px rgba(160,160,160,0.50);
    }

    .arrow {
      margin-left: 10px;
      top: -1px;
      position:relative;
    }
  }

  .btn--submit {
    position: absolute;
    font-size: 24px;
    right: 10px;
    /* Rounded button: */
    background: #FFFFFF;
    border-radius: 100px;
    height: 52px;
    width: 178px;
    border: 0px;
    font-weight: 800;
    color: black;
    text-transform: uppercase;

    &:focus {
      background: #FFFFFF;
    }

    &:hover {
      box-shadow: 1px 1px 4px 2px rgba(160,160,160,0.50);
    }

    .arrow {
      margin-left: 10px;
      top: -1px;
      position:relative;
    }
  }
}

.fa-question-circle {
  color: #898989;
  font-size: 18px;
  top: -10px;
  position: relative;
  cursor: pointer;
}

.progress-tip {
  position: absolute;
  bottom: 10px;
  left: 50%;
}

/* Loading indicator */
.loading {
  position: relative;
  margin:0 auto;
  width: 62px;    /* diameter */
  height: 62px;    /* diameter */
}
.inner, .loading:after {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
/* Mask */
.loading:after {
  content:" ";
  margin: 10%;    /* stroke width */
  border-radius: 100%;
  background: #fff;    /* container background */
}
/* Spinning gradients */
.inner {
  animation-duration: 1s;    /* speed */
  -webkit-animation-duration: 1s;    /* speed */
  animation-iteration-count: infinite;
  -webkit-animation-iteration-count: infinite;
  animation-timing-function: linear;
  -webkit-animation-timing-function: linear;
}
.inner {
  animation-name: rotate-inner;
  -webkit-animation-name: rotate-inner;
}
/* Halfs */
.inner:before, .inner:after {
  position: absolute;
  top: 0;
  bottom: 0;
  content:" ";
}
/* Left half */
.inner:before {
  left: 0;
  right: 50%;
  border-radius: 72px 0 0 72px;    /* diameter */
}
/* Right half */
.inner:after {
  left: 50%;
  right: 0;
  border-radius: 0 72px 72px 0;    /* diameter */
}
/* Half gradients */
.inner:before {
  background-image: linear-gradient(to bottom, #0029DD 0%, #D700D0 100%);
}
.inner:after {
    background-image: linear-gradient(to bottom, #ffffff 0%, #D8D8D8 100%);
}

/* Spinning animations */

@keyframes rotate-inner {
  0% {
    transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
  }
}
@-webkit-keyframes rotate-inner {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}
</style>
