'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 700,
    useContentSize: true,
    width: 1200,
    minWidth: 1200,
    minHeight: 700
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('form', (event, status) => {
  console.log(status)
  event.sender.send('form', status)
})

ipcMain.on('email', (event, data) => {
  event.sender.send('emaildata', data)
})

ipcMain.on('password', (event, data) => {
  event.sender.send('passdata', data)
})

ipcMain.on('code', (event, data) => {
  event.sender.send('codedata', data)
})

ipcMain.on('filter_confirm', (event, data) => {
  event.sender.send('filterconfirmation', data)
})

ipcMain.on('filter_option', (event, data) => {
  event.sender.send('filteroption', data)
})

ipcMain.on('filters', (event, data) => {
  event.sender.send('filters', data)
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
