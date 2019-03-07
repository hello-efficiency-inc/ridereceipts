'use strict'

import { app, BrowserWindow, ipcMain, Menu, session, shell } from 'electron'
import fkill from 'fkill'
import Store from 'electron-store'
import jetpack from 'fs-jetpack'
import fs from 'fs'
import path from 'path'

import 'electron-context-menu'

// let myWindow = null
const store = new Store()

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

const openAboutWindow = require('about-window').default

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
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ]

  const version = app.getVersion()

  if (process.platform === 'win32') {
    template.unshift({
      label: 'Ride Receipts',
      submenu: [
        {
          label: 'About',
          click: () =>
            openAboutWindow({
              icon_path: path.join(__static, '/256x256.png'),
              copyright: 'Copyright (c) 2018 Hello Efficiency Inc.',
              open_devtools: process.env.NODE_ENV !== 'production',
              homepage: 'https:/ridereceipts.io',
              product_name: 'Ride Receipts',
              package_json_dir: path.join(__dirname, '../..'),
              use_version_info: false
            })
        },
        {
          label: 'View license',
          click: () => shell.openExternal('https://ridereceipts.io/license-agreement/')
        },
        {
          label: `Version ${version}`,
          enabled: false
        },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Ride Receipts',
      submenu: [
        { role: 'about' },
        {
          label: 'View license',
          click: () => shell.openExternal('https://ridereceipts.io/license-agreement/')
        },
        {
          label: `Version ${version}`,
          enabled: false
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
// Allow only one instance
app.requestSingleInstanceLock()
app.on('second-instance', function (event, argv, cwd) {
  app.quit()
})

app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => {
  session.defaultSession.clearStorageData()
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

// Download PDF
ipcMain.on('downloadPDF', (event, data) => {
  const documentDir = jetpack.cwd(store.get('invoicePath'))
  const rideDirectory = data.rideType
  var invoiceDate = data.invoiceDate
  var folderPath
  folderPath = `${documentDir.path()}/${data.email}/${rideDirectory}/${data.year}/`

  if (!jetpack.exists(documentDir.path(folderPath))) {
    jetpack.dir(documentDir.path(folderPath))
  }

  const pdfBrowser = new BrowserWindow({ show: false, webPreferences: { devTools: false, nodeIntegration: true } })
  pdfBrowser.loadURL(data.html)
  pdfBrowser.webContents.on('did-finish-load', () => {
    pdfBrowser.webContents.printToPDF({
      marginsType: 1,
      pageSize: 'A4',
      printBackground: true
    }, (error, data) => {
      if (error) throw error
      fs.writeFile(`${folderPath}/${rideDirectory}-${invoiceDate}.pdf`, data, (error) => {
        if (error) throw error
        pdfBrowser.close()
      })
    })
  })
})
