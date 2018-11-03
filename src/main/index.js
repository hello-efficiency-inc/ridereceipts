'use strict'

import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import fkill from 'fkill'
import Store from 'electron-store'
import updateElectron from 'update-electron-app'
import electronLog from 'electron-log'

import 'electron-context-menu'

let myWindow = null
const store = new Store()

updateElectron({
  repo: 'ridereceipts/ridereceipts',
  updateInterval: '1 hour',
  logger: electronLog
})

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
  // Turn off debug by default
  store.set('debug', false)

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
  mainWindow.webContents.openDevTools()

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
        } }
    ] }, {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ] }
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
