<template>
  <div>
     <div class="splash" v-if="form === null">
      <img id="logo" src="static/uber-run.svg" alt="Uber Run">
      <spinner></spinner>
    </div>
    <div class="wrapper" v-if="form !== null">
     <nav class="navbar navbar-light bg-transparent">
       <div class="navbar-brand">
         <img src="static/uber-run.svg" alt="Uber Run" width="80">
        </div>
      </nav>
      <transition name="fade">
        <div class="jumbotron form--container" v-if="form === 'EMAIL'" key="email">
          <div class="form-group">
            <label for="email">Please enter your Uber account email address.</label>
            <input type="email" class="form-control form-control-lg"  @keyup.enter="submitForm()" v-model="fields.email" id="email" aria-describedby="emai" placeholder="Enter email">
          </div>
        </div>
         <div class="jumbotron form--container" v-if="form === 'PASSWORD'" key="password">
          <div class="form-group">
            <label for="password">Please enter your Uber account password.</label>
            <input type="password" class="form-control form-control-lg" @keyup.enter="submitForm()" id="password" v-model="fields.password" aria-describedby="password" placeholder="Enter Password">
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'VERIFICATION'" key="verification">
          <div class="form-group">
            <label for="verification">Please enter your verification code that is sent to you via SMS</label>
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
            <div v-for="filter in fields.filters" :key="filter.id"  class="form-check">
              <label class="form-check-label">
                <input class="form-check-input" type="radio" @keyup.enter="submitForm()" v-model="fields.filter_option" :id="filter.id" :value="filter.id">
                {{ filter.name }}
              </label>
            </div>
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
            <label>Grabbing all invoice links from the website. Please wait ...</label>
            <br/>
            <spinner></spinner>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'INVOICE_COUNT'" key="invoicecounts">
          <div class="form-group">
            <label>We found {{ fields.invoice_count }} invoices ! 🎉 🎉 🎉</label>
            <br/>
            <div class="progress" style="height: 30px;">
              <div class="progress-bar" role="progressbar" :style="{ width: percent + '%' }" :aria-valuenow="percent" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <p>Downloading invoices please wait ...</p>
          </div>
        </div>
        <div class="jumbotron form--container" v-if="form === 'DOWNLOADED'" key="downloaded">
          <div class="form-group">
            <label>Awesome downloaded all invoices ! 🎉 🎉 🎉</label>
            <p class="invoice-link">To view all downloaded invoices <a href="" @click.stop.prevent="openInvoiceFolder()">Click here</a></p>
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
      fields: {
        email: null,
        password: null,
        verification_code: null,
        filters: [],
        filter_option: null,
        filter_confirm: null,
        download_invoice: null,
        invoice_count: null
      },
      percent: null,
      downloaded: false,
      dir_cleanup: false
    }
  },
  components: {
    Spinner
  },
  mounted () {
    puppeteer()
    this.$electron.ipcRenderer.on('form', (event, data) => {
      this.form = data
    })
    this.$electron.ipcRenderer.on('filters', (event, data) => {
      this.fields.filters = data
    })
    this.$electron.ipcRenderer.on('invoiceTotal', (event, data) => {
      this.fields.invoice_count = data
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
      if (this.form === 'GENERATE_LINKS') {
        return true
      }
      if (this.form === 'INVOICE_COUNT') {
        return true
      }
      return false
    },
    errorButton () {
      if (this.form === 'DOWNLOADED') {
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
    startAgain () {
      this.fields = {}
      puppeteer()
    },
    openInvoiceFolder () {
      const documentDir = jetpack.cwd(this.$electron.remote.app.getPath('documents'))
      this.$electron.shell.openItem(documentDir.path('Uber Invoice'))
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

  img {
    height: 180px;
    margin-bottom: 40px;
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
    font-size: 3em;
    font-weight: 700;
    margin-bottom: 15px;
    line-height: 1.3;
  }

  .form-check-label {
    font-size: 1.3em;
    line-height: 1.3em;
  }

  input {
    outline: none;
    border: none;
    border-bottom: 2px solid rgba(0, 0, 0, 02);
    background-color: transparent;
    border-radius: 0px;
    font-size: 2.5em;
    color: #0B1E4E;
    text-overflow: ellipsis;
    font-weight: bold;

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
</style>
