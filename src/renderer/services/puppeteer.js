import puppeteer from 'puppeteer'
import jetpack from 'fs-jetpack'
import os from 'os'
import _ from 'lodash'
import moment from 'moment-timezone'
import { remote, ipcRenderer } from 'electron'

const PAGE_CLOSE = 'PAGE_CLOSE'
const EMAIL = 'EMAIL'
const PASSWORD = 'PASSWORD'
const VERIFICATION = 'VERIFICATION'
const CHROME_NOT_FOUND = 'CHROME_NOT_FOUND'
const FILTER_CONFIRM = 'FILTER_CONFIRM'
const FILTER_OPTION = 'FILTER_OPTION'
const DOWNLOAD_INVOICE = 'DOWNLOAD_INVOICE'
const INVOICE_COUNT = 'INVOICE_COUNT'
// const INVOICE_PROGRESS = 'INVOICE_PROGRESS'
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
    ipcRenderer.once('filterconfirmation', (event, data) => {
      resolve(data)
    })
  })
  return confirm
}

async function getMonth () {
  const month = new Promise((resolve) => {
    ipcRenderer.once('monthdata', (event, data) => {
      resolve(data)
    })
  })
  return month
}

async function downloadInvoice () {
  const confirm = new Promise((resolve) => {
    ipcRenderer.once('downloadconfirmation', (event, data) => {
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
  const NEXT_PAGINATION = '#trips-pagination > div:nth-child(2) > a'
  const NEXT_PAGINATION_INACTIVE_BUTTON = '#trips-pagination > div:nth-child(2) > div.btn--inactive'
  const INACTIVE_PREVIOUS_BUTTON = '.btn--inactive.pagination__previous'
  const INACTIVE_NEXT_BUTTON = '.btn--inactive.pagination__next'
  const VERIFY_BUTTON = '#app-body > div > div > form > button'
  const FILTER_TRIPS = '#slide-menu-content > div > div.flexbox__item.flexbox__item--expand > div > div > div.flexbox__item.four-fifths.page-content > div.hidden--palm > div > div > div.flexbox__item.one-third.text--left > a'
  const SUBMIT_FILTER = '#trip-filterer-button'
  const DOWNLOAD_INVOICE_TRIP = '#data-invoice-btn-download'
  const useDataDir = jetpack.cwd(remote.app.getAppPath()).cwd(remote.app.getPath('desktop'))
  const documentDir = jetpack.cwd(remote.app.getPath('documents'))
  const platform = os.platform()

  let exec

  // Get Executable Path by Platform
  switch (platform) {
    case 'darwin':
      exec = `${useDataDir.path()}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
      //  exec = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      break
    case 'linux':
      exec = `${useDataDir.path()}/chrome-linux/chrome`
      break
    case 'win32':
      if (os.arch() === 'x64') {
        exec = `${useDataDir.path()}/chrome-win32/chrome.exe`
      }
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
    headless: true,
    timeout: 0,
    executablePath: exec,
    args: [
      '--disable-gpu'
    ]
  })

  const page = await browser.newPage()
  await page.setUserAgent(desktopAgents[Math.floor(Math.random() * desktopAgents.length)])

  // Launch Page
  await page.goto('https://auth.uber.com/login?next_url=https://riders.uber.com', {waitUntil: 'domcontentloaded'})

  await page.on('error', () => {
    page.close()
    browser.close()
  })

  await page.on('console', msg => {
    for (let i = 0; i < msg.args.length; ++i) {
      console.log(`${i}: ${msg.args[i]}`)
    }
  })

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
  await page.keyboard.type(await getEmail(), {delay: 50})
  await page.click(NEXT_BUTTON)
  await page.waitFor(1000)

  const emailVisibility = await page.evaluate(() => {
    const display = document.querySelector('#username')
    return display !== null
  })

  if (!emailVisibility) {
    ipcRenderer.send('form', ERROR)
    await browser.close()
  }

  await page.waitForSelector(PASSWORD_SELECTOR)
  await page.click(PASSWORD_SELECTOR)
  ipcRenderer.send('form', PASSWORD)
  await page.keyboard.type(await getPassword(), {delay: 100})
  await page.click(NEXT_BUTTON)

  await page.waitForSelector(PASSWORD_SELECTOR, { hidden: true })
  await page.click(SMS_SELECTOR)
  ipcRenderer.send('form', VERIFICATION)
  await page.keyboard.type(await getCode(), { delay: 100 })
  await page.click(VERIFY_BUTTON)

  await page.waitForNavigation()
  ipcRenderer.send('form', FILTER_CONFIRM)

  await page.waitForSelector(FILTER_TRIPS)
  if (await getFilterConfirm() === 'true') {
    await page.click(FILTER_TRIPS)

    await page.waitFor(1000)
    // Fetch list of available filters
    const filterList = await page.evaluate(() => {
      let data = []
      const elements = document.querySelectorAll('#trip-filterer > div:nth-child(1) > div > div.grid__item.three-quarters.palm-one-whole input')
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          console.log(document.querySelector(`label[for='${elements[i].id}']`))
          const item = {
            id: elements[i].id,
            name: document.querySelector(`label[for='${elements[i].id}']`).innerText
          }
          data.push(item)
        }
      }

      return data
    })
    ipcRenderer.send('form', FILTER_OPTION)
    ipcRenderer.send('filters', filterList)

    const filterSelected = await getMonth()

    const FILTER_ITEM = `label[for=${filterSelected}]`

    await page.waitFor(1000)

    await page.click(FILTER_ITEM)
    await page.click(SUBMIT_FILTER)
  }

  ipcRenderer.send('form', DOWNLOAD_INVOICE)

  await page.waitFor(1000)

  if (await downloadInvoice()) {
    await page.waitFor(1000)

    const DETAIL_LISTS = []

    // Loop Until next button is disabled
    while (await page.$(NEXT_PAGINATION_INACTIVE_BUTTON) === null) {
      await page.waitFor(1000)

      // Evaluate list of detail links
      const list = await page.evaluate(() => {
        const data = []
        const detailElement = document.querySelectorAll('#trips-table div.flexbox__item.one-third.lap-one-half.separated--left.soft-double--left.hidden--palm > div.trip-info-tools > ul > li:nth-child(2) > a')

        for (let i = 0; i < detailElement.length; ++i) {
          const tripId = detailElement[i].href.split('/')
          data.push(`https://riders.uber.com/get_invoices?q={"trip_uuid": "${tripId[4]}"}`)
        }

        return data
      })

      DETAIL_LISTS.push(list)

      if (await page.$(NEXT_PAGINATION) !== null) {
        await page.click(NEXT_PAGINATION)
      } else {
        continue
      }
    }

    await page.waitFor(1000)

    if (await page.$(INACTIVE_NEXT_BUTTON) !== null && await page.$(INACTIVE_PREVIOUS_BUTTON) !== null) {
      await page.waitFor(1 * 1000)

      // Evaluate list of detail links
      const list = await page.evaluate(() => {
        const data = []
        const detailElement = document.querySelectorAll('#trips-table div.flexbox__item.one-third.lap-one-half.separated--left.soft-double--left.hidden--palm > div.trip-info-tools > ul > li:nth-child(2) > a')
        for (let i = 0; i < detailElement.length; ++i) {
          const tripId = detailElement[i].href.split('/')
          data.push(`https://riders.uber.com/get_invoices?q={"trip_uuid": "${tripId[4]}"}`)
        }
        return data
      })

      DETAIL_LISTS.push(list)
    }

    // Final list of invoice object links
    const DETAIL_ITEMS = []

    // Go through each link and store JSON Details
    for (let i = 0; i < _.flattenDeep(DETAIL_LISTS).length; ++i) {
      await page.goto(_.flattenDeep(DETAIL_LISTS)[i], { waitUntil: 'domcontentloaded' })
      const tripItem = await page.evaluate(() => {
        const element = document.querySelector('body')
        return JSON.parse(element.innerHTML)
      })
      // Check if the data is there. If it is then push it to array
      if (tripItem.length > 0) {
        DETAIL_ITEMS.push(tripItem[0])
      }
      await page.waitFor(1000)
    }

    DETAIL_ITEMS.map((item) => {
      item.month = moment(item.invoice_date).format('MMMM')
      item.invoice_date = moment(item.invoice_date).tz('America/Toronto').format('MMMM-DD-YYYY_hh-mm-ss-a')
      return item
    })

    ipcRenderer.send('form', INVOICE_COUNT)
    ipcRenderer.send('invoiceTotal', DETAIL_ITEMS.length)

    for (let i = 0; i < DETAIL_ITEMS.length; ++i) {
      await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: documentDir.path(`Uber Invoice/${DETAIL_ITEMS[i].month}/`)})
      await page.goto(`https://riders.uber.com/trips/${DETAIL_ITEMS[i].trip_uid}`, {waitUntil: 'networkidle2'})

      const progress = _.ceil(_.divide(i, DETAIL_ITEMS.length) * 100)

      // Check if request button is hidden
      const invoiceRequest = await page.evaluate(() => {
        return document.querySelector('#data-invoice-btn-request') && document.querySelector('#data-invoice-btn-request').classList.contains('hidden')
      })

      // Check if request invoice button is hidden. Then go ahead download it.
      if (invoiceRequest) {
        await page.waitFor(1 * 2000)
        await page.click(DOWNLOAD_INVOICE_TRIP)
      }

      ipcRenderer.send('progress', progress)
      await page.waitFor(1000)
    }

    for (let i = 0; i < DETAIL_ITEMS.length; ++i) {
      if (jetpack.exists(`${documentDir.path()}/Uber Invoice/${DETAIL_ITEMS[i].month}/invoice-${DETAIL_ITEMS[i].invoice_number}.pdf`)) {
        jetpack.rename(`${documentDir.path()}/Uber Invoice/${DETAIL_ITEMS[i].month}/invoice-${DETAIL_ITEMS[i].invoice_number}.pdf`, `${DETAIL_ITEMS[i].invoice_date}.pdf`)
      }
    }
  }

  await browser.close()
}
