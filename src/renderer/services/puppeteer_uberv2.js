import puppeteer from 'puppeteer'
import jetpack from 'fs-jetpack'
import _ from 'lodash'
import dayjs from 'dayjs'
import { ipcRenderer } from 'electron'
import Store from 'electron-store'
import axios from 'axios'

const PAGE_CLOSE = 'PAGE_CLOSE'
const EMAIL = 'EMAIL'
const PASSWORD = 'PASSWORD'
const VERIFICATION = 'VERIFICATION'
const CHROME_NOT_FOUND = 'CHROME_NOT_FOUND'
const FILTER_OPTION = 'FILTER_OPTION'
const INVOICE_COUNT = 'INVOICE_COUNT'
const GENERATE_LINKS = 'GENERATE_LINKS'
const DOWNLOADED = 'DOWNLOADED'
const ERROR_EMAIL = 'error-email'
const ERROR_PASS = 'error-pass'
const ERROR_CAPTCHA = 'CAPTCHA'
const ERROR_CAPTCHA_NOT_SOLVED = 'error-captcha'
const store = new Store()

// Listen to Event Once
async function listenEvent (eventname) {
  const data = new Promise((resolve, reject) => {
    ipcRenderer.once(eventname, (event, data) => {
      resolve(data)
    })
  })
  return data
}

// Get Solved Token
async function solveCaptcha (page) {
  // Get Recaptcha Key
  const siteToken = await page.evaluate(() => {
    const jsonData = JSON.parse(document.querySelector('#json-globals').innerHTML)
    return jsonData.state.config.recaptchaSiteKey
  })

  let tokenText

  // Solve it!
  let token = await axios.post('https://api.uberrun.io/solvecaptcha', { key: siteToken })

  tokenText = token.data.text

  if (tokenText === '?') {
    ipcRenderer.send('form', ERROR_CAPTCHA_NOT_SOLVED)
  }

  if (tokenText === '' && token.data.is_correct === true) {
    while (tokenText === '') {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const getToken = await axios.get(`https://api.uberrun.io/gettoken/${token.data.captcha}`)
      tokenText = getToken.data.text
    }
  }

  if (tokenText !== '?') {
    await page.evaluate((tokenText) => {
      document.querySelector('#g-recaptcha-response').innerHTML = tokenText
    }, tokenText)
  } else {
    ipcRenderer.send('form', ERROR_CAPTCHA_NOT_SOLVED)
  }
}

// Check for ReCaptcha
async function evaluateReCaptcha (page) {
  const checkRecaptcha = await page.evaluate(() => {
    const captcha = document.querySelector('#login-recaptcha').innerHTML
    if (captcha !== '') {
      return true
    }
    return false
  })

  return checkRecaptcha
}

// Evaluate Password or Email Error
async function evaluateError (page) {
  const errorCheck = await page.evaluate(() => {
    const error = document.querySelector('#error-caption')
    if (error !== null) {
      return error.innerHTML !== ''
    }
    return false
  })

  return errorCheck
}

// Launch Puppeteer
async function launch (puppeteer, exec) {
  let debug
  if (store.get('debug')) {
    debug = false
  } else {
    debug = true
  }
  return puppeteer.launch({
    headless: debug,
    timeout: 0,
    executablePath: exec,
    args: [
      '--disable-gpu'
    ]
  })
}

export default async function () {
  // Selectors Needed
  const EMAIL_SELECTOR = '#useridInput'
  const PASSWORD_SELECTOR = '#password'
  const SMS_SELECTOR = '#verificationCode'
  const NEXT_BUTTON = '#app-body > div > div:nth-child(1) > form > button'
  const VERIFY_BUTTON = '#app-body > div > div > form > button'
  const DASHBOARD = '#root'
  // const NEXT_PAGINATION = '#trips-pagination > div:nth-child(2) > a'
  // const NEXT_PAGINATION_INACTIVE_BUTTON = '#trips-pagination > div:nth-child(2) > div.btn--inactive'
  // const INACTIVE_PREVIOUS_BUTTON = '.btn--inactive.pagination__previous'
  // const INACTIVE_NEXT_BUTTON = '.btn--inactive.pagination__next'
  // const DOWNLOAD_INVOICE_TRIP = '#data-invoice-btn-download'
  const documentDir = jetpack.cwd(store.get('invoicePath'))
  let exec
  if (process.env.NODE_ENV !== 'development') {
    exec = puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked')
  } else {
    exec = puppeteer.executablePath()
  }

  // If executable path not found then throw error
  if (!jetpack.exists(exec)) {
    ipcRenderer.send('form', CHROME_NOT_FOUND)
    return
  }

  const browser = await launch(puppeteer, exec)
  store.set('processPID', browser.process().pid) // Store process ID to kill when app quits

  const page = await browser.newPage()

  await page.setViewport({
    width: 1440,
    height: 990,
    deviceScaleFactor: 2
  })

  await page.setCacheEnabled(true)
  await page.setJavaScriptEnabled(true)

  // Launch Page
  await page.goto('https://auth.uber.com/login?next_url=https://riders.uber.com', { waitUntil: 'domcontentloaded' })

  await page.on('error', () => {
    page.close()
    browser.close()
  })

  await page.on('console', msg => console.log(msg._text))

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
  const accountEmail = await listenEvent('emaildata')
  await page.keyboard.type(accountEmail, { delay: 60 })
  await page.click(NEXT_BUTTON)
  await page.waitFor(1000)

  const reCaptcha = await evaluateReCaptcha(page)
  const emailError = await evaluateError(page)

  if (emailError && !reCaptcha) {
    ipcRenderer.send('form', ERROR_EMAIL)
  }

  if (!emailError && reCaptcha) {
    ipcRenderer.send('form', ERROR_CAPTCHA)
    await solveCaptcha(page)
    const errorCheck = await evaluateError(page)
    if (errorCheck) {
      await page.waitFor(1000)
      ipcRenderer.send('form', ERROR_EMAIL)
    } else {
      await page.waitFor(1000)
      await page.click('#app-body > div > div > div:nth-child(1) > form > button')
    }
  }

  await page.waitForSelector(PASSWORD_SELECTOR, {
    timeout: 0
  })

  await page.click(PASSWORD_SELECTOR)
  ipcRenderer.send('form', PASSWORD)
  await page.keyboard.type(await listenEvent('passdata'), { delay: 60 })
  await page.click(NEXT_BUTTON)

  const evaluateErrorPass = await evaluateError(page)
  // Evaluate Password Error
  if (evaluateErrorPass) {
    ipcRenderer.send('form', ERROR_PASS)
  }

  await page.waitFor(1000)
  const verificationCode = await page.evaluate(() => {
    const verificationCode = document.querySelector('#verificationCode')
    if (verificationCode) {
      return true
    }
    return false
  })

  if (verificationCode) {
    ipcRenderer.send('form', VERIFICATION)
    await page.click(SMS_SELECTOR)
    await page.keyboard.type(await listenEvent('codedata'), { delay: 30 })
    await page.click(VERIFY_BUTTON)
  }

  await page.waitFor(1500)

  await page.waitForSelector(DASHBOARD)
  ipcRenderer.send('form', FILTER_OPTION)
  await page.exposeFunction('jsonstringify', obj => JSON.stringify(obj))
  await page.exposeFunction('stringunescape', (text) => {
    return text.replace(/\\u[\dA-F]{4}/gi, (match) => {
      return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
    })
  })

  const filterOption = await listenEvent('filteroption')
  const currentYear = {
    fromTime: dayjs().startOf('year').valueOf(),
    toTime: dayjs().endOf('year').valueOf()
  }
  const previousYear = {
    fromTime: dayjs().subtract(1, 'years').startOf('year').valueOf(),
    toTime: dayjs().subtract(1, 'years').endOf('year').valueOf()
  }
  const month = {
    fromTime: dayjs().subtract(1, 'month').add(1, 'day').startOf('month').valueOf(),
    toTime: dayjs().subtract(1, 'month').add(1, 'day').endOf('month').valueOf()
  }
  const last3Months = {
    fromTime: dayjs().subtract(3, 'month').add(1, 'day').startOf('month').valueOf(),
    toTime: dayjs().endOf('month').valueOf()
  }

  ipcRenderer.send('form', GENERATE_LINKS)
  let filterType

  // If Filter Option chosen is Current Year
  if (filterOption === 'currentyear') {
    filterType = currentYear
  }

  // If Filter Option chosen is Last Year
  if (filterOption === 'previousyear') {
    filterType = previousYear
  }

  // If filter option chosen is Last Month
  if (filterOption === 'lastmonth') {
    filterType = month
  }

  // If Filter option chosen is Last 3 Months
  if (filterOption === 'lastthreemonths') {
    filterType = last3Months
  }

  // Fetch Trips
  let tripData = []
  let hasMore
  let offset = 0
  while (hasMore !== false) {
    const data = await page.evaluate(`(async () => {
      const data = document.getElementById('__CSRF_TOKEN__').textContent
      const normalizedData = await window.stringunescape(data)
      const offset = ${offset}
      const obj = await window.jsonstringify({ limit: 50, offset: offset.toString(), range: { fromTime: ${filterType.fromTime}, toTime: ${filterType.toTime} } })
      const fetchData = await fetch('/api/getTripsForClient', {
        method: 'POST',
        cors: 'no-cors',
        headers: {
          'x-csrf-token': normalizedData.replace(/['"]+/g, ''),
          'Content-Type': "application/json; charset=utf-8"
        },
        body: obj
      })
      const responseData = await fetchData.json()
      return responseData
    })()`)
    hasMore = data.data.trips.pagingResult.hasMore
    offset = data.data.trips.pagingResult.nextCursor
    data.data.trips.trips.forEach((trip) => {
      if ((trip.status === 'CANCELED' && trip.clientFare !== 0) ||
      trip.status === 'COMPLETED') {
        tripData.push(trip)
      }
    })
  }

  tripData.map((item) => {
    item.link = `https://riders.uber.com/trips/${item.uuid}`
    item.year = dayjs(item.requestTime).format('YYYY')
    item.month = dayjs(item.requestTime).format('MMMM')
    item.invoice_date = dayjs(item.requestTime).format('MMMM-DD-YYYY_hh-mm-a')
    return item
  })

  ipcRenderer.send('form', INVOICE_COUNT)
  ipcRenderer.send('invoiceTotal', tripData)
  await page.exposeFunction('getTripId', (trip) => trip.uuid)

  for (let i = 0; i < tripData.length; ++i) {
    await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: documentDir.path(`${accountEmail}/Uber/${tripData[i].year}/${tripData[i].month}/${tripData[i].invoice_date}`) })
    await page.goto(tripData[i].link, { waitUntil: 'networkidle0' })

    const progress = i === (tripData.length - 1) ? _.ceil(_.divide(i + 1, tripData.length) * 100) : _.ceil(_.divide(i, tripData.length) * 100)

    await page.waitFor(3500)
    // Download as pdf of the page to keep record of trip with map
    if (!jetpack.exists(documentDir.path(`${documentDir.path()}/${accountEmail}/Uber/${tripData[i].year}/${tripData[i].month}/${tripData[i].invoice_date}`))) {
      jetpack.dir(documentDir.path(`${documentDir.path()}/${accountEmail}/Uber/${tripData[i].year}/${tripData[i].month}/${tripData[i].invoice_date}`))
    }

    const receiptFilePath = `${documentDir.path()}/${accountEmail}/Uber/${tripData[i].year}/${tripData[i].month}/${tripData[i].invoice_date}/Receipt-${tripData[i].invoice_date}.png`
    await page.screenshot({
      path: receiptFilePath,
      fullPage: true
    })

    await page.evaluate(() => {
      const spans = document.querySelectorAll('span')
      for (var i = 0; i < spans.length; i++) {
        if (spans[i].textContent === 'Save Invoice') {
          spans[i].click()
          break
        }
      }
    })

    ipcRenderer.send('progress', progress)
    await page.waitFor(3000)
  }

  for (let i = 0; i < tripData.length; ++i) {
    const filePath = jetpack.find(`${documentDir.path()}/${accountEmail}/Uber/${tripData[i].year}/${tripData[i].month}/${tripData[i].invoice_date}/`, { matching: '*invoice*' })
    if (filePath.length > 0) {
      jetpack.rename(filePath[0], `Invoice-${tripData[i].invoice_date}.pdf`)
    }
  }

  ipcRenderer.send('form', DOWNLOADED)

  await page.waitFor(1000)

  store.delete('browserEndpoint')
  await browser.close()
}
