import puppeteer from 'puppeteer'
import jetpack from 'fs-jetpack'
import downloader from 'puppeteer/utils/ChromiumDownloader'
import { remote, ipcRenderer } from 'electron'

const PAGE_CLOSE = 'PAGE_CLOSE'
const EMAIL = 'EMAIL'
const PASSWORD = 'PASSWORD'
const VERIFICATION = 'VERIFICATION'
const CHROME_NOT_FOUND = 'CHROME_NOT_FOUND'
const FILTER_CONFIRM = 'FILTER_CONFIRM'
const ERROR = 'ERROR'

// Desktop User Agents
const desktopAgents = ['Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0']

async function getEmail () {
  const email = new Promise((resolve, reject) => {
    ipcRenderer.once('emaildata', (event, data) => {
      resolve(data)
    })
  })
  return email
}

async function getPassword () {
  const password = new Promise((resolve, reject) => {
    ipcRenderer.once('passdata', (event, data) => {
      resolve(data)
    })
  })
  return password
}

async function getCode () {
  const code = new Promise((resolve) => {
    ipcRenderer.once('codedata', (event, data) => {
      resolve(data)
    })
  })
  return code
}

async function getFilterConfirm () {
  const confirm = new Promise((resolve) => {
    ipcRenderer.once('confirmdata', (event, data) => {
      resolve(data)
    })
  })
  return confirm
}

export default async function () {
  // Selectors Needed
  const EMAIL_SELECTOR = '#useridInput'
  const PASSWORD_SELECTOR = '#password'
  const SMS_SELECTOR = '#verificationCode'
  const NEXT_BUTTON = '#app-body > div > div:nth-child(1) > form > button'
  // const NEXT_PAGINATION = '#trips-pagination > div:nth-child(2) > a'
  // const NEXT_PAGINATION_INACTIVE_BUTTON = '#trips-pagination > div:nth-child(2) > div.btn--inactive'
  // const INACTIVE_PREVIOUS_BUTTON = '.btn--inactive.pagination__previous'
  // const INACTIVE_NEXT_BUTTON = '.btn--inactive.pagination__next'
  const VERIFY_BUTTON = '#app-body > div > div > form > button'
  const FILTER_TRIPS = '#slide-menu-content > div > div.flexbox__item.flexbox__item--expand > div > div > div.flexbox__item.four-fifths.page-content > div.hidden--palm > div > div > div.flexbox__item.one-third.text--left > a'
  // const SUBMIT_FILTER = '#trip-filterer-button'
  // const DOWNLOAD_INVOICE = '#data-invoice-btn-download'
  // const DASHBOARD_PAGE = '#slide-menu-content > div > div.flexbox__item.flexbox__item--expand > div > div > div.flexbox__item.one-fifth.page-sidebar.hidden--portable > ul > li.soft--ends > div.center-block.three-quarters.push-half--bottom > div > img'
  const useDataDir = jetpack.cwd(remote.app.getAppPath()).cwd(remote.app.getPath('desktop'))

  const platform = downloader.currentPlatform()

  let exec

  // Get Executable Path by Platform
  switch (platform) {
    case 'mac':
      exec = `${useDataDir.path()}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
      break
    case 'linux':
      exec = `${useDataDir.path()}/chrome-linux/chrome`
      break
    case 'win32':
      exec = `${useDataDir.path()}/chrome-win32/chrome.exe`
      break
    case 'win64':
      exec = `${useDataDir.path()}/chrome-win32/chrome.exe`
      break
  }

  // If executable path not found then throw error
  if (!jetpack.exists(exec)) {
    ipcRenderer.send('form', CHROME_NOT_FOUND)
    return
  }

  const browser = await puppeteer.launch({
    headless: false,
    timeout: 0,
    executablePath: exec
  })

  const page = await browser.newPage()
  await page.setUserAgent(desktopAgents[Math.floor(Math.random() * desktopAgents.length)])

  // Launch Page
  await page.goto('https://auth.uber.com/login?next_url=https://riders.uber.com', {waitUntil: 'domcontentloaded'})

  // Check for Rate Limit
  const rateLimit = await page.evaluate(() => {
    if (document.querySelector('body').innerText === 'HARD') {
      return true
    }
    return false
  })

  if (rateLimit) {
    ipcRenderer.send('browser', PAGE_CLOSE)
    page.close()
    return browser.close()
  }

  // Login Account
  await page.click(EMAIL_SELECTOR)
  ipcRenderer.send('form', EMAIL)
  await page.keyboard.type(await getEmail(), {delay: 100})
  await page.click(NEXT_BUTTON)

  if (await page.$(PASSWORD_SELECTOR) === null) {
    ipcRenderer.send('form', ERROR)
    await page.screenshot({path: `${useDataDir.path()}/screenshot.png`})
    page.close()
    return browser.close()
  }

  await page.waitForSelector(PASSWORD_SELECTOR)
  await page.click(PASSWORD_SELECTOR, 200)
  ipcRenderer.send('form', PASSWORD)
  await page.keyboard.type(await getPassword(), {delay: 100})
  await page.click(NEXT_BUTTON)

  if (await page.$(SMS_SELECTOR) !== null) {
    await page.click(SMS_SELECTOR, 200)
    ipcRenderer.send('form', VERIFICATION)
    await page.keyboard.type(await getCode(), { delay: 100 })
    await page.click(VERIFY_BUTTON)
  }

  await page.waitForNavigation()
  ipcRenderer.send('form', FILTER_CONFIRM)

  await page.waitForSelector(FILTER_TRIPS)
  if (await getFilterConfirm()) {}
  await page.screenshot({path: `${useDataDir.path()}/screenshot.png`})

  await browser.close()
}
