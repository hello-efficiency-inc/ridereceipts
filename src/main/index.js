'use strict'

import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { autoUpdater } from 'electron-updater'
import fkill from 'fkill'
import Store from 'electron-store'

import 'electron-context-menu'

let myWindow = null

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
    height: 650,
    useContentSize: true,
    width: 960,
    minWidth: 900,
    minHeight: 600,
    resizable: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Create the Application's main menu
  const template = [{
    label: 'Application',
    submenu: [
      { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
      { type: 'separator' },
      { label: 'Quit',
        accelerator: 'Command+Q',
        click: function () {
          app.quit()
        }}
    ]}, {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ]}
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
// Allow only one instance
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (myWindow) {
    if (myWindow.isMinimized()) myWindow.restore()
    myWindow.focus()
  }
})

if (isSecondInstance) {
  app.quit()
}

app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => {
  const store = new Store()
  if (store.has('processPID')) {
    fkill(store.get('processPID', {
      force: true
    }))
    store.delete('processPID')
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('online-status-changed', (event, status) => {
  event.sender.send('onlinestatus', status)
})

ipcMain.on('form', (event, status) => {
  event.sender.send('form', status)
})

ipcMain.on('invoiceTotal', (event, status) => {
  event.sender.send('invoiceTotal', status)
})

ipcMain.on('progress', (event, status) => {
  event.sender.send('progress', status)
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

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
