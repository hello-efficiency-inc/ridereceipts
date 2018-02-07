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
const FILTER_OPTION = 'FILTER_OPTION'
const INVOICE_COUNT = 'INVOICE_COUNT'
const GENERATE_LINKS = 'GENERATE_LINKS'
const DOWNLOADED = 'DOWNLOADED'
const ERROR_EMAIL = 'error-email'
const ERROR_PASS = 'error-pass'
const ERROR_VERI = 'error-veri'

// Calculate Last 3 Month from current month
async function getLast3Months () {
  let last3Months = []

  for (let i = 0; i <= 3; i++) {
    const month = moment().subtract(i, 'month').add(1, 'day').format('MMMM')
    const year = moment().subtract(i, 'month').add(1, 'day').format('YYYY')
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

const customWaitFor = function (timeToWait) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, timeToWait)
  })
}

// Evaluate Password or Email Error
async function evaluateError (page) {
  const errorCheck = await page.evaluate(() => {
    const error = document.querySelector('#error-caption')
    return error !== null
  })

  return errorCheck
}

// Grab list
async function evaluateList (page) {
  // Evaluate list of detail links
  const list = await page.evaluate(() => {
    const data = []
    const detailElement = document.querySelectorAll('#trips-table div > div.flexbox__item.one-half.lap-one-half.separated--left.soft-double--left.hidden--palm > div.trip-info-tools > ul > li:nth-child(2) > a')

    for (let i = 0; i < detailElement.length; ++i) {
      const tripId = detailElement[i].href.split('/')
      data.push(`https://riders.uber.com/get_invoices?q={"trip_uuid": "${tripId[4]}"}`)
    }

    return data
  })

  return list
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
  const useDataDir = jetpack.cwd(remote.app.getAppPath()).cwd(remote.app.getPath('desktop'))
  const documentDir = jetpack.cwd(remote.app.getPath('documents'))
  const platform = os.platform()

  let exec

  // Get Executable Path by Platform
  switch (platform) {
    case 'darwin':
      exec = `${useDataDir.path()}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`
      //  exec = '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'
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
  await page.keyboard.type(accountEmail, {delay: 30})
  await page.click(NEXT_BUTTON)
  await page.waitFor(1000)

  // const emailVisibility = await page.evaluate(() => {
  //   const display = document.querySelector('#username')
  //   return display !== null
  // })
  //
  const emailError = await evaluateError(page)

  // Evaluate Email Error
  if (emailError) {
    ipcRenderer.send('form', ERROR_EMAIL)
    await browser.close()
  }

  // if (!emailVisibility) {
  //   ipcRenderer.send('form', ERROR)
  //   await browser.close()
  // }

  await page.waitForSelector(PASSWORD_SELECTOR)
  await page.click(PASSWORD_SELECTOR)
  ipcRenderer.send('form', PASSWORD)
  await page.keyboard.type(await listenEvent('passdata'), {delay: 30})
  await page.click(NEXT_BUTTON)

  await customWaitFor(1500)

  const evaluateErrorPass = await evaluateError(page)

  // Evaluate Password Error
  if (evaluateErrorPass) {
    ipcRenderer.send('form', ERROR_PASS)
    await browser.close()
  }

  await page.click(SMS_SELECTOR)
  ipcRenderer.send('form', VERIFICATION)
  await page.keyboard.type(await listenEvent('codedata'), { delay: 30 })
  await page.click(VERIFY_BUTTON)

  await customWaitFor(1500)

  const checkInput = await page.evaluate(() => {
    const error = document.querySelector('#verificationCode')
    return error !== null
  })

  if (checkInput) {
    const evaluateErrorVeri = await evaluateError(page)

    if (checkInput && evaluateErrorVeri) {
      ipcRenderer.send('form', ERROR_VERI)
      await browser.close()
    }
  } else {
    ipcRenderer.send('form', FILTER_OPTION)
  }

  await page.waitForSelector(FILTER_TRIPS)

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

  await page.waitFor(1000)

  if (await page.$(INACTIVE_NEXT_BUTTON) !== null && await page.$(INACTIVE_PREVIOUS_BUTTON) !== null) {
    await page.waitFor(1000)

    // Evaluate list of detail links
    const list = await evaluateList(page)

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
      await page.waitFor(200)
    } else {
      await page.waitFor(600)
    }
  }

  DETAIL_ITEMS.map((item) => {
    item.year = moment(item.invoice_date).format('YYYY')
    item.month = moment(item.invoice_date).format('MMMM')
    item.invoice_date = moment(item.invoice_date).tz('America/Toronto').format('MMMM-DD-YYYY_hh-mm-a')
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
    uniqItems = _.uniqBy(_.filter(DETAIL_ITEMS, ['month', month]), 'invoice_date')
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
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: documentDir.path(`Uber Run/${accountEmail}/${uniqItems[i].year}/${uniqItems[i].month}/`)})
    await page.goto(`https://riders.uber.com/trips/${uniqItems[i].trip_uid}`, {waitUntil: 'networkidle2'})

    const progress = i === (uniqItems.length - 1) ? _.ceil(_.divide(i + 1, uniqItems.length) * 100) : _.ceil(_.divide(i, uniqItems.length) * 100)

    // Check if request button is hidden
    const invoiceRequest = await page.evaluate(() => {
      return document.querySelector('#data-invoice-btn-request') && document.querySelector('#data-invoice-btn-request').classList.contains('hidden')
    })

    // Check if request invoice button is hidden. Then go ahead download it.
    if (invoiceRequest) {
      await page.waitFor(1 * 3000)
      await page.click(DOWNLOAD_INVOICE_TRIP)
    }

    ipcRenderer.send('progress', progress)
    await page.waitFor(2000)
  }

  for (let i = 0; i < uniqItems.length; ++i) {
    const invoiceFilePath = `${documentDir.path()}/Uber Run/${accountEmail}/${uniqItems[i].year}/${uniqItems[i].month}/invoice-${uniqItems[i].invoice_number}.pdf`
    if (jetpack.exists(invoiceFilePath)) {
      jetpack.rename(invoiceFilePath, `${uniqItems[i].invoice_date}.pdf`)
    }
  }

  ipcRenderer.send('form', DOWNLOADED)

  await page.waitFor(1000)

  await browser.close()
}
