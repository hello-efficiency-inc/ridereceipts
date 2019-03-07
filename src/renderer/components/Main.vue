<template>
  <div class="main-splash">
    <div>
      <img id="logo" src="static/ride-receipts.svg" alt="Ride Receipts" key="mainpage">
      <div style="width: 550px;">
        <p>Download your rideshare receipts and<br/>invoices automatically.</p>
        <div class="loading" v-if="loading">
          <div class="inner"></div>
        </div>
        <div v-if="!licenseKey && !loading">
          <p class="choose-app">Please enter license key to get started.</p>
          <div class="form-group">
            <b-form-input id="email"
                  v-model.trim="licenseKeyValue"
                  type="text"
                  :state="licenseError"
                  aria-describedby="license licenseFeedback"
                  placeholder="License Key" required>
              </b-form-input>
              <b-form-invalid-feedback id="licenseFeedback">
                    {{ licenseErrorMessage }}
              </b-form-invalid-feedback>
           </div>
           <p class="text-center">
            <button class="btn btn-lg main-btn" tag="button" @click="submitLicenseKey">Submit</button>
          </p>
        </div>
        <div v-if="licenseKey && !loading">
          <p class="choose-app">Choose an app to get started:</p>
          <p class="text-center">
            <router-link :to="{ name: 'uber' }" class="btn btn-lg main-btn" tag="button">
              Uber
            </router-link>
            <span class="option-text">or</span>
            <router-link :to="{ name: 'lyft' }" class="btn btn-lg main-btn" tag="button">
              Lyft
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import request from 'request'
import { GUMROAD_PRODUCT_ID, TEST_LICENSE_KEY, API_URI } from '../config'
import Store from 'electron-store'
import dayjs from 'dayjs'
import { machineIdSync } from 'node-machine-id'
import axios from 'axios'
import crypto from 'crypto'
import os from 'os'
const store = new Store()

export default {
  data () {
    return {
      progress: null,
      downloaded: true,
      licenseKeyExpired: false,
      licenseKeyExpiring: false,
      licenseKeyMessage: '',
      licenseKey: false,
      licenseKeyValue: '',
      licenseError: true,
      loading: false,
      licenseErrorMessage: null
    }
  },
  mounted () {
    this.checkLicenseKey()
  },
  methods: {
    checkLicenseKey () {
      const self = this
      const licenseKey = store.get('license_key')
      let machine = machineIdSync({ original: true })
      let machineId = crypto.createHash('sha512').update(machine).digest('hex')
      const testLicenseKey = TEST_LICENSE_KEY
      this.loading = true
      if (licenseKey === testLicenseKey) {
        this.licenseKey = licenseKey
        self.loading = false
      } else {
        request.post(`https://api.gumroad.com/v2/licenses/verify`, {
          form: {
            product_permalink: GUMROAD_PRODUCT_ID,
            increment_uses_count: false,
            license_key: licenseKey
          } }, async function (err, res, body) {
          if (err) {}
          var data = JSON.parse(body)
          if (data.purchase) {
            var subscribedAt = dayjs(data.purchase.created_at)
            var expiresAt = dayjs(data.purchase.created_at).add(1, 'year')
            var days = expiresAt.diff(subscribedAt, 'day')
            self.licenseKeyExpiring = days > 0 && days <= 30
            self.licenseKeyExpired = days === 0
            self.$store.dispatch('setDays', days)
            if (self.licenseKeyExpiring) {
              self.$store.dispatch('setLicenseExpiring', days)
            }

            if (self.licenseKeyExpired) {
              self.$store.dispatch('setLicenseExpired', days)
            }
          }

          if (data.success === false) {
            self.licensekey = false
            self.loading = false
          } else {
            try {
              const verifyMachine = await axios.post(`${API_URI}/machine/verify`, {
                license_key: licenseKey,
                machine_id: machineId
              })
              if (!verifyMachine.data.data.success && verifyMachine.data.data.machines === 0) {
                self.activateMachine(licenseKey, machineId, data)
              }
              self.licenseKey = licenseKey
              self.loading = false
            } catch (e) {
              self.activateMachine(licenseKey, machineId, data)
              self.licenseKey = licenseKey
              self.loading = false
            }
          }
        })
      }
    },
    async activateMachine (key, machineId, data) {
      const activateMachine = await axios.post(`${API_URI}/machine/activate`, {
        license_key: key,
        sales_id: data.purchase.id,
        email: data.purchase.email,
        machine_id: machineId,
        product_type: 'Ride Receipts Basic'
        platform: os.platform() === 'darwin' ? 'Mac' : 'Windows'
      })
      if (activateMachine.data.data.success) {
        store.set('license_key', self.licenseKeyValue)
        this.licenseKey = key
        this.licenseError = false
      }
    },
    submitLicenseKey () {
      const self = this
      const testLicenseKey = TEST_LICENSE_KEY
      let machine = machineIdSync({ original: true })
      let machineId = crypto.createHash('sha512').update(machine).digest('hex')
      if (this.licenseKeyValue === testLicenseKey) {
        store.set('license_key', this.licenseKeyValue)
        this.licenseKey = this.licenseKeyValue
        this.licenseError = true
      } else {
        request.post(`https://api.gumroad.com/v2/licenses/verify`, {
          form: {
            product_permalink: GUMROAD_PRODUCT_ID,
            license_key: this.licenseKeyValue
          } }, async function (err, res, body) {
          if (err) {}
          var data = JSON.parse(body)
          if (data.success === false) {
            self.licenseKey = null
            self.licenseErrorMessage = 'Oops license key is invalid.'
            self.licenseError = false
          } else if (data.success === true) { // limit license usage
            try {
              const verifyMachine = await axios.post(`${API_URI}/machine/verify`, {
                license_key: self.licenseKeyValue,
                machine_id: machineId
              })
              if (!verifyMachine.data.data.success && verifyMachine.data.data.machines < 2) {
                await self.activateMachine(self.licenseKeyValue, machineId, data)
              } else if (!verifyMachine.data.data.success && verifyMachine.data.data.machines === 2) {
                self.licenseErrorMessage = 'License key usage limit exceeded.'
                self.licenseError = false
              } else {
                store.set('license_key', self.licenseKeyValue)
                self.licenseKey = self.licenseKeyValue
                self.licenseError = true
              }
            } catch (e) {
              self.activateMachine(self.licenseKeyValue, machineId, data)
            }
          }
        })
      }
    }
  }
}
</script>
<style lang="scss">
.main-splash {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 100vw;
  min-height: 100vh;

  .choose-app {
    color: #000;
    font-weight: 800;
  }

  p {
    font-size: 20px;
    color: #000808;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
  }
}

.option-text {
  font-size: 20px;
  font-weight: 800;
  margin-left: 20px;
  margin-right: 20px;
  color: black;
}

.main-btn {
  display:inline-block;
  border: none;
  position: relative;
  background: transparent;
  padding-top: 15px;
  // padding-left: 58px;
  // padding-right: 58px;
  padding-bottom: 15px;
  border-radius: 100px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 15px;
  width: 160px;

  &:hover {
    background: #00afb0;
    color: #fff;

    &:before {
      background: none;
    }
  }

  &:before,
  &:after {
    content: ' ';
    position: absolute;
    border-radius: 100px;
  }

  &:before {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -2;
    background: #0029dd;
    background: -moz-linear-gradient(top, #00afb0 0%, #003132 100%);
    background: -webkit-linear-gradient(top, #00afb0 0%, #003132 100%);
    background: linear-gradient(to bottom, #00afb0 0%,#003132 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#003132', endColorstr='#00afb0',GradientType=0 );
  }

  &:after {
    top: 2px;
    bottom: 2px;
    left: 2px;
    right: 2px;
    background-color: #fff;
    z-index: -1;
    opacity: 1;
    transition: all 0.6s ease-in-out;
  }
}
</style>
