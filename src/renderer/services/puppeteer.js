import puppeteer from 'puppeteer-core'
import Store from 'electron-store'
import jetpack from 'fs-jetpack'

const chromeLauncher = require('chrome-launcher')
const request = require('request')
const util = require('util')
const store = new Store()

// Launch Puppeteer
async function launch (puppeteer) {
  let flag = [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-sandbox',
    '--no-zygote',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--proxy-server="direct://"',
    '--proxy-bypass-list=*'
  ]
  return chromeLauncher.launch({
    chromeFlags: flag
  })
}

export default async function (email, headers, year, month, invoiceDate, html, rideType) {
  const documentDir = jetpack.cwd(store.get('invoicePath'))
  const chrome = await launch(puppeteer)
  store.set('processPID', chrome.pid) // Store process ID to kill when app quits
  const resp = await util.promisify(request)(`http://localhost:${chrome.port}/json/version`)
  const { webSocketDebuggerUrl } = JSON.parse(resp.body)
  const browser = await puppeteer.connect({
    browserWSEndpoint: webSocketDebuggerUrl
  })

  const rideDirectory = rideType

  const page = await browser.newPage()
  await page.setCacheEnabled(true)
  await page.setExtraHTTPHeaders(headers)
  await page.setContent(html)
  await page.waitFor(1000)

  if (!jetpack.exists(documentDir.path(`${documentDir.path()}/${email}/${rideDirectory}/${year}/`))) {
    jetpack.dir(documentDir.path(`${documentDir.path()}/${email}/${rideDirectory}/${year}/`))
  }

  await page.emulateMedia('print')
  const receiptFilePath = `${documentDir.path()}/${email}/${rideDirectory}/${year}/${month}/${rideDirectory}-${invoiceDate}.pdf`
  await page.pdf({
    path: receiptFilePath,
    format: 'A4',
    printBackground: true
  })

  store.delete('browserEndpoint')
  await page.close()
  await browser.close()
  await chrome.kill()
  return true
}
