import Store from 'electron-store'
import axios from 'axios'
import { API_URI } from '../renderer/config'

const { dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')
const PRODUCT_TYPE = 'Ride Receipts Basic'

const store = new Store()

let updater
autoUpdater.autoDownload = false

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', error == null ? 'Oops something went wrong.' : (error.stack || error).toString())
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now? ✅',
    buttons: ['Sure', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate()
    } else {
      updater.enabled = true
      updater = null
    }
  })
})

autoUpdater.on('update-not-available', () => {
  if (typeof updater !== 'undefined') {
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date. 🎉'
    })
    updater.enabled = true
    updater = null
  }
  log.info('Current version is up-to-date. 🎉')
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

export const autoUpdateApp = () => {
  const licensekey = store.get('license_key')
  axios.post(`${API_URI}/license/verify`, { license_key: licensekey, product_type: PRODUCT_TYPE }).then((res) => {
    const expired = res.data.data.expired
    if (!expired) {
      autoUpdater.checkForUpdates()
    } else {
      dialog.showMessageBox({
        title: 'No Updates',
        message: 'Your license key is expired. Please renew license key by repurchasing it from https://ridereceipts.io. ❌'
      })
    }
  }).catch((err) => {
    if (err) {
      log.error(err)
      log.info('No license found in database')
    }
  })
}

// export this to MenuItem click callback
export const checkForUpdates = (menuItem, focusedWindow, event) => {
  updater = menuItem
  updater.enabled = false
  const licensekey = store.get('license_key')
  axios.post(`${API_URI}/license/verify`, { license_key: licensekey, product_type: PRODUCT_TYPE }).then((res) => {
    const expired = res.data.data.expired
    if (!expired) {
      autoUpdater.checkForUpdates()
    } else {
      dialog.showMessageBox({
        title: 'No Updates',
        message: 'Your license key is expired. Please renew license key by repurchasing it from https://ridereceipts.io. ❌'
      })
    }
  }).catch((err) => {
    if (err) {
      log.error(err)
      dialog.showMessageBox({
        title: 'No Updates',
        message: 'License key not found in our database. ☹'
      })
      updater.enabled = true
    }
  })
}
