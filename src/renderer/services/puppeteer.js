import puppeteer from 'puppeteer'
import jetpack from 'fs-jetpack'
import _ from 'lodash'
import moment from 'moment-timezone'
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

// Calculate Last 3 Month from current month
async function getLast3Months () {
  let last3Months = []

  for (let i = 1; i < 4; ++i) {
    const month = moment().subtract(i, 'month').format('MMMM')
    const year = moment().subtract(i, 'month').format('YYYY')
    last3Months.push({ 'month': month, 'year': year })
  }

  return last3Months
}

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
      await new Promise(resolve => setTimeout(resolve, 2500))
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

// Grab list
async function evaluateList (page) {
  // Evaluate list of detail links
  const list = await page.evaluate(() => {
    const data = []
    const rowData = document.querySelectorAll('tr.hard')

    for (let i = 0; i < rowData.length; ++i) {
      // Check for dark section
      const darkSection = rowData[i].childNodes[0].querySelector('div.flexbox__item.one-half.palm-one-whole.lap-one-half.align--top > div.section--dark')
      // Check for Fare Breakdown
      const fareBreakDown = rowData[i].childNodes[0].querySelector('h3').innerText
      // Check for Trip Link
      const tripLink = rowData[i].childNodes[0].querySelector('div.flexbox__item.one-half.lap-one-half.separated--left.soft-double--left.hidden--palm > div > ul > li:nth-child(2) > a').href
      let timeDate

      if (darkSection !== null) {
        timeDate = rowData[i].childNodes[0].querySelector('div.flexbox__item.one-half.palm-one-whole.lap-one-half').querySelector('h6').innerText
      } else {
        timeDate = rowData[i].childNodes[0].querySelector('.trip-expand > div >  div.flexbox__item:nth-child(1) > h6').innerText
      }
      if (fareBreakDown !== '') { // Only include if there is amount included
        data.push({
          trip: tripLink,
          time: timeDate
        })
      }
    }

    return data
  })

  return list
}

// Launch Puppeteer
async function launch (puppeteer, exec) {
  return puppeteer.launch({
    headless: true,
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
  const FILTER_TRIPS = '#slide-menu-content > div > div.flexbox__item.flexbox__item--expand > div > div > div.flexbox__item.four-fifths.page-content > div.hidden--palm > div > div > div.flexbox__item.one-third.text--left > a'
  const NEXT_PAGINATION = '#trips-pagination > div:nth-child(2) > a'
  const NEXT_PAGINATION_INACTIVE_BUTTON = '#trips-pagination > div:nth-child(2) > div.btn--inactive'
  const INACTIVE_PREVIOUS_BUTTON = '.btn--inactive.pagination__previous'
  const INACTIVE_NEXT_BUTTON = '.btn--inactive.pagination__next'
  const DOWNLOAD_INVOICE_TRIP = '#data-invoice-btn-download'
  const store = new Store()
  const documentDir = jetpack.cwd(store.get('invoicePath'))
  let exec = store.get('chromePath')

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
  const accountEmail = await listenEvent('emaildata')
  await page.keyboard.type(accountEmail, {delay: 60})
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

  await page.waitFor(2000)
  await page.waitForSelector(PASSWORD_SELECTOR, {
    timeout: 0
  })
  await page.click(PASSWORD_SELECTOR)
  ipcRenderer.send('form', PASSWORD)
  await page.keyboard.type(await listenEvent('passdata'), {delay: 30})
  await page.click(NEXT_BUTTON)

  await page.waitFor(1800)

  const evaluateErrorPass = await evaluateError(page)
  // Evaluate Password Error
  if (evaluateErrorPass) {
    ipcRenderer.send('form', ERROR_PASS)
  }

  await page.click(SMS_SELECTOR)
  ipcRenderer.send('form', VERIFICATION)
  await page.keyboard.type(await listenEvent('codedata'), { delay: 30 })
  await page.click(VERIFY_BUTTON)

  await page.waitFor(1500)

  await page.waitForSelector(FILTER_TRIPS)
  ipcRenderer.send('form', FILTER_OPTION)

  const filterOption = await listenEvent('filteroption')
  const currentYear = moment().format('YYYY')
  const previousYear = moment().subtract(1, 'years').format('YYYY')
  const month = moment().subtract(1, 'month').add(1, 'day').format('MMMM')
  const last3Months = await getLast3Months()

  await page.waitFor(1000)

  const DETAIL_LISTS = []

  ipcRenderer.send('form', GENERATE_LINKS)

  // Loop Until next button is disabled
  while (await page.$(NEXT_PAGINATION_INACTIVE_BUTTON) === null) {
    await page.waitFor(1000)

    // Evaluate list of detail links
    const list = await evaluateList(page)

    DETAIL_LISTS.push(list)

    if (await page.$(NEXT_PAGINATION) !== null) {
      await page.click(NEXT_PAGINATION)
    } else {
      continue
    }
  }

  await page.waitFor(1500)

  if (await page.$(INACTIVE_NEXT_BUTTON) !== null && await page.$(INACTIVE_PREVIOUS_BUTTON) !== null) {
    await page.waitFor(1000)

    // Evaluate list of detail links
    const list = await evaluateList(page)
    DETAIL_LISTS.push(list)
  }

  // Final list of invoice object links
  const DETAIL_ITEMS = _.flattenDeep(DETAIL_LISTS).map((item) => {
    item.year = moment(item.time).format('YYYY')
    item.month = moment(item.time).format('MMMM')
    item.invoice_date = moment(item.time).format('MMMM-DD-YYYY_hh-mm-a')
    return item
  })

  let uniqItems

  // If Filter Option chosen is Current Year
  if (filterOption === 'currentyear') {
    uniqItems = _.uniqBy(_.filter(DETAIL_ITEMS, ['year', currentYear]), 'invoice_date')
  }

  // If Filter Option chosen is Last Year
  if (filterOption === 'previousyear') {
    uniqItems = _.uniqBy(_.filter(DETAIL_ITEMS, ['year', previousYear]), 'invoice_date')
  }

  // If filter option chosen is Last Month
  if (filterOption === 'lastmonth') {
    uniqItems = _.filter(DETAIL_ITEMS, { 'month': month, 'year': currentYear })
  }

  // If Filter option chosen is Last 3 Months
  if (filterOption === 'lastthreemonths') {
    const filteredItems = _.filter(DETAIL_ITEMS, (o) => {
      const index = _.findIndex(last3Months, { 'month': o.month, 'year': o.year })
      return index >= 0
    })
    uniqItems = _.uniqBy(filteredItems, 'invoice_date')
  }

  ipcRenderer.send('form', INVOICE_COUNT)
  ipcRenderer.send('invoiceTotal', uniqItems.length)

  for (let i = 0; i < uniqItems.length; ++i) {
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: documentDir.path(`${accountEmail}/Uber/${uniqItems[i].year}/${uniqItems[i].month}/${uniqItems[i].invoice_date}`)})
    await page.goto(uniqItems[i].trip, {waitUntil: 'networkidle0'})

    const progress = i === (uniqItems.length - 1) ? _.ceil(_.divide(i + 1, uniqItems.length) * 100) : _.ceil(_.divide(i, uniqItems.length) * 100)

    // Check if request button is hidden
    const invoiceRequest = await page.evaluate(() => {
      return document.querySelector('#data-invoice-btn-request') && document.querySelector('#data-invoice-btn-request').classList.contains('hidden')
    })

    await page.waitFor(5000)
    // Download as pdf of the page to keep record of trip with map
    if (!jetpack.exists(documentDir.path(`${documentDir.path()}/${accountEmail}/Uber/${uniqItems[i].year}/${uniqItems[i].month}/${uniqItems[i].invoice_date}`))) {
      jetpack.dir(documentDir.path(`${documentDir.path()}/${accountEmail}/Uber/${uniqItems[i].year}/${uniqItems[i].month}/${uniqItems[i].invoice_date}`))
    }

    await page.emulateMedia('print')
    const receiptFilePath = `${documentDir.path()}/${accountEmail}/Uber/${uniqItems[i].year}/${uniqItems[i].month}/${uniqItems[i].invoice_date}/Receipt-${uniqItems[i].invoice_date}.pdf`
    await page.pdf({
      path: receiptFilePath,
      width: '1440px',
      height: '900px',
      format: 'A4',
      printBackground: true,
      pageRanges: '1'
    })

    // Check if request invoice button is hidden. Then go ahead download it.
    if (invoiceRequest) {
      await page.click(DOWNLOAD_INVOICE_TRIP)
    }

    ipcRenderer.send('progress', progress)
    await page.waitFor(1500)
  }

  for (let i = 0; i < uniqItems.length; ++i) {
    const filePath = jetpack.find(`${documentDir.path()}/${accountEmail}/Uber/${uniqItems[i].year}/${uniqItems[i].month}/${uniqItems[i].invoice_date}/`, { matching: '*invoice*' })
    if (filePath.length > 0) {
      jetpack.rename(filePath[0], `Invoice-${uniqItems[i].invoice_date}.pdf`)
    }
  }

  ipcRenderer.send('form', DOWNLOADED)

  await page.waitFor(1000)

  store.delete('browserEndpoint')
  await browser.close()
}
