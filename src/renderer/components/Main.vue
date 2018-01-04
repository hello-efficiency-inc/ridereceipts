<template>
  <div>
    <transition name="fade">
    <div class="splash" v-if="form === null">
      <div class="wrap-content">
        <img id="logo" src="static/uber-run.svg" alt="Uber Run">
        <p>Download your Uber invoices automatically.</p>
        <br/>
        <p><button type="button" @click="startAgain" v-if="!loading" class="btn btn-lg btn-started">Get Started</button></p>
        <spinner v-if="loading"></spinner>
      </div>
    </div>
  </transition>
    <div class="wrapper" v-if="form !== null">
      <nav class="navbar navbar-light bg-transparent">
        <div class="navbar-brand">
          <img src="static/uber-run.svg" alt="Uber Run" width="100">
        </div>
      </nav>
      <transition name="fade">
        <div class="jumbotron form--container" v-if="form === 'EMAIL'" key="email">
          <div class="form-group">
            <label for="email">Enter the email address associated with your Uber account</label>
            <input type="email" class="form-control form-control-lg"  @keyup.enter="submitForm()" v-model="fields.email" id="email" aria-describedby="emai" placeholder="Enter email">
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'PASSWORD'" key="password">
          <div class="form-group">
            <label for="password">Enter the password for your Uber<br/>account <i class="far fa-2x fa-question-circle" v-b-popover.hover.bottom="'Uber Run is an automation script that tells the Chromium browser to downlod your invoices. This app has no database; therefore, it does not store your login credentials, personal information or any other data. It is a secure as logging into your Uber account through your browser.'" title="Security"></i></label>
            <input type="password" class="form-control form-control-lg" @keyup.enter="submitForm()" id="password" v-model="fields.password" aria-describedby="password" placeholder="Enter Password">
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'VERIFICATION'" key="verification">
          <div class="form-group">
            <label for="verification">Enter the Uber verification code sent to you via SMS</label>
            <input type="text" class="form-control form-control-lg" @keyup.enter="submitForm()" id="verification" v-model="fields.verification_code" aria-describedby="verification" placeholder="Verification code">
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'FILTER_CONFIRM'" key="filterconfirm">
          <div class="form-group">
            <label>Do you want to filter your trips ?</label>
            <div class="form-check">
              <label class="form-check-label">
                <input class="form-check-input" type="radio"  @keyup.enter="submitForm()" v-model="fields.filter_confirm" name="filter" value="true">
                Yes
              </label>
            </div>
            <div class="form-check">
              <label class="form-check-label">
                <input class="form-check-input" type="radio" @keyup.enter="submitForm()" v-model="fields.filter_confirm" name="filter" value="false">
                No
              </label>
            </div>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'FILTER_OPTION'" key="filteroption">
          <div class="form-group">
            <label>Please choose a month you want to retrieve invoices from.</label>
            <label v-for="filter in fields.filters" :key="filter.id" class="form-check-label">
              <input class="form-check-input" type="radio" @keyup.enter="submitForm()" v-model="fields.filter_option" :value="filter.id">
              {{ filter.name }}
            </label>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'DOWNLOAD_INVOICE'" key="downloadinvoice">
          <div class="form-group">
            <label>Do you want to download invoices ?</label>
            <div class="form-check">
              <label class="form-check-label">
                <input class="form-check-input" @keyup.enter="submitForm()" v-model="fields.download_invoice" type="radio" id="download" value="true">
                Yes
              </label>
            </div>
            <div class="form-check">
              <label class="form-check-label">
                <input class="form-check-input" @keyup.enter="submitForm()" v-model="fields.download_invoice" type="radio" id="download" value="false">
                No
              </label>
            </div>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'GENERATE_LINKS'" key="generatelinks">
          <div class="form-group">
            <label>Checking your Uber account for all available invoices within the time frame you selected. Please wait.</label>
            <br/>
            <spinner></spinner>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'INVOICE_COUNT'" key="invoicecounts">
          <div class="form-group">
            <label>{{ downloadingMessage }}</label>
            <br/>
            <div class="progress" style="height: 30px;">
              <div class="progress-bar" role="progressbar" :style="{ width: percent + '%' }" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'DOWNLOADED'" key="downloaded">
          <div class="form-group">
            <label>Success ! All invoices have been<br/> downloaded for you.</label>
            <p class="text-center"><button type="button" @click.stop.prevent="openInvoiceFolder()" class="btn btn-lg btn-started">View Invoices</button></p>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'ERROR'" :key="error">
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
                <button type="button" v-if="!errorButton" @keyup.enter="submitForm()" @click="submitForm()" class="btn btn-outline-primary btn--submit">Continue</button>
                <button type="button" v-if="errorButton" @keyup.enter="startForm()" @click="startAgain()" class="btn btn-outline-primary btn--submit">Start Again</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Spinner from 'vue-simple-spinner'
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
        filters: [],
        filter_option: null,
        filter_confirm: null,
        download_invoice: null
      },
      downloadingMessage: null,
      percent: null,
      downloaded: false,
      dir_cleanup: false
    }
  },
  components: {
    Spinner
  },
  mounted () {
    this.$electron.ipcRenderer.on('form', (event, data) => {
      this.loading = false
      this.form = data
    })
    this.$electron.ipcRenderer.on('filters', (event, data) => {
      this.setFilter(data)
    })
    this.$electron.ipcRenderer.on('invoiceTotal', (event, data) => {
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
      return false
    },
    errorButton () {
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
    setFilter (data) {
      this.fields.filters = data
    },
    downloadMessage (count) {
      if (count > 76) {
        this.downloadingMessage = `Wow this could take a while ! Let Uber Run do its thing and we'll let you know once your ${count} are in order.`
      } else if (count > 56 && count <= 76) {
        this.downloadingMessage = `Whoa ${count} invoices! Put your feet up and relax. This will take a while, my friend.`
      } else if (count > 46 && count <= 56) {
        this.downloadingMessage = `You have ${count} invoices. Give the little robot some time to download and organize them for you.`
      } else if (count > 36 && count <= 46) {
        this.downloadingMessage = `Whoa someone's been busy! You have ${count} invoices. Downloading now.`
      } else if (count > 26 && count <= 36) {
        this.downloadingMessage = `You have ${count} invoices. Downloading and organizing them for you now, Sweet deal, huh ?`
      } else if (count > 16 && count <= 26) {
        this.downloadingMessage = `You have ${count} invoices. Pour yourself a drink and relax. We got this.`
      } else if (count > 11 && count <= 16) {
        this.downloadingMessage = `You have ${count} invoices!\nRun, Uber Run!`
      } else if (count > 6 && count <= 11) {
        this.downloadingMessage = `You have ${count} invoices!\nThis should download fairly quickly.`
      } else if (count > 0 && count <= 6) {
        this.downloadingMessage = `Running this app for just ${count} invoices?\nThat's okay, we won't judge ;)`
      } else {
        this.downloadingMessage = `You have 0 invoices within the time frame you selected.`
      }
    },
    startAgain () {
      this.fields = {}
      this.loading = true
      puppeteer()
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
        case 'FILTER_CONFIRM':
          this.$electron.ipcRenderer.send('filter_confirm', this.fields.filter_confirm)
          break
        case 'FILTER_OPTION':
          this.$electron.ipcRenderer.send('filter_option', this.fields.filter_option)
          break
        case 'DOWNLOAD_INVOICE':
          this.$electron.ipcRenderer.send('download_invoice', this.fields.download_invoice)
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

  p {
    font-size: 25px;
    color: #2c32c4;
  }
}

.btn-started {
  background: #d800d0;
  color: white;
  border-radius: 30px;
  padding-left: 25px;
  padding-right: 25px;
  text-transform: uppercase;
  font-size: 16px;
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
    font-size: 2.5em;
    text-align: center;
    font-weight: 700;
    margin-bottom: 35px;
    line-height: 1.2;
    color: black;
  }

  .form-check-label {
    display: block;
    margin-bottom: 10px;
    font-size: 1.3em;
    line-height: 1.3em;
  }

  input {
    outline: none;
    border: none;
    border-bottom: 2px solid rgba(0, 0, 0, 02);
    background-color: transparent;
    border-radius: 0px;
    font-size: 2em;
    color: black;
    text-overflow: ellipsis;
    font-weight: bold;
    border-image:  linear-gradient(to right, rgba(0,41,221,1) 0%, rgba(215,1,208,1) 100%);
    border-image-slice: 1;

    &:focus {
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

  .btn--submit {
    position: absolute;
    padding: 0.6em 1.5em;
    border-radius: 40px;
    right: 10px;

    &:after {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      line-height: 2;
      background: transparent;
      text-align: center;
      color: black;
      content: 'or press ENTER';
      font-size: 0.85em;
      pointer-events: none;
      font-weight: 600;
    }
  }
}

.fa-question-circle {
  color: #e3e3e3;
  font-size: 18px;
  top: -10px;
  position: relative;
}
</style>
