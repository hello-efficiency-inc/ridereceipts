<template>
  <div>
    <div class="splash" v-if="form === null">
      <div class="wrap-content">
        <img id="logo" src="static/uber-run.svg" alt="Uber Run">
        <p>Download your Uber invoices and receipts automatically.</p>
        <br/>
        <p><button type="button" @click="startAgain" v-if="!loading" class="btn btn-lg btn-started" :disabled="!online">Get Started with Uber</button></p>
        <p>OR</p>
        <p><router-link :to="{ name: 'lyft' }" class="btn btn-lg btn-started" tag="button">Get Started with Lyft</router-link></p>
        <p class="offline" v-if="!online">You are currently offline. Please get online to use this app.</p>
        <div class="loading" v-if="loading">
          <div class="inner"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import puppeteer from '../services/puppeteer'

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
      veriError: true,
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
      if (this.form === 'CAPTCHA') {
        return true
      }
      if (!this.online) {
        return true
      }
      return false
    },
    hideButton () {
      if (this.form === 'error-captcha') {
        return false
      }
      if (!this.emailError) {
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
    downloadMessage (count) {
      if (count > 76) {
        this.downloadingMessage = `Wow this could take a while! Let Uber Run do its thing and we'll let you know once your ${count} trips are in order.`
      } else if (count > 56 && count <= 76) {
        this.downloadingMessage = `Whoa ${count} trips! Put your feet up and relax. This will take a while, my friend.`
      } else if (count > 46 && count <= 56) {
        this.downloadingMessage = `You have ${count} trips. Give the little robot some time to download and organize them for you.`
      } else if (count > 36 && count <= 46) {
        this.downloadingMessage = `Whoa someone's been busy! You have ${count} trips. Downloading now.`
      } else if (count > 26 && count <= 36) {
        this.downloadingMessage = `You have ${count} trips. Downloading and organizing them for you now. Sweet deal, huh?`
      } else if (count > 16 && count <= 26) {
        this.downloadingMessage = `You have ${count} trips. Pour yourself a drink and relax. We got this.`
      } else if (count > 11 && count <= 16) {
        this.downloadingMessage = `You have ${count} trips!\nRun, Uber Run!`
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
