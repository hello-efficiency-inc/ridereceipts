#!/usr/bin/env node
'use strict';

// Required Packages
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const _ = require('lodash');
const log = console.log;
const ora = require('ora');
const moment = require('moment');

// Desktop User Agents
const desktop_agents = ['Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14',
'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0'];

// Selectors Needed
const EMAIL_SELECTOR = '#useridInput';
const PASSWORD_SELECTOR = '#password';
const SMS_SELECTOR ='#verificationCode';
const NEXT_BUTTON = '#app-body > div > div:nth-child(1) > form > button';
const NEXT_PAGINATION = '#trips-pagination > div:nth-child(2) > a';
const NEXT_PAGINATION_INACTIVE_BUTTON = '#trips-pagination > div:nth-child(2) > div.btn--inactive';
const INACTIVE_PREVIOUS_BUTTON = '.btn--inactive.pagination__previous';
const INACTIVE_NEXT_BUTTON = '.btn--inactive.pagination__next';
const VERIFY_BUTTON = '#app-body > div > div > form > button';
const FILTER_TRIPS = '#slide-menu-content > div > div.flexbox__item.flexbox__item--expand > div > div > div.flexbox__item.four-fifths.page-content > div.hidden--palm > div > div > div.flexbox__item.one-third.text--left > a';
const SUBMIT_FILTER = '#trip-filterer-button';
const DOWNLOAD_INVOICE = '#data-invoice-btn-download';

// Prompt for Email Address
async function getEmail() {
  const email = await new Promise((resolve, reject) => {
    const schema =
    [{
      type: 'input',
      name: 'email',
      message: "Please enter your email"
    }];
    inquirer.prompt(schema).then(answers => {
      resolve(answers.email);
    });
  });
  return email;
}

// Prompt for Password
async function getPassword() {
  const password = await new Promise((resolve, reject) => {
    const schema =
    [{
      type: 'password',
      name: 'password',
      message: "Please enter your password"
    }];
    inquirer.prompt(schema).then(answers => {
      resolve(answers.password);
    });
  });
  return password;
}

// Prompt for verification code via SMS
async function getVerificationCode() {
  const code =  await new Promise((resolve, reject) => {
    const schema =
    [{
      type: 'input',
      name: 'code',
      message: "Please enter your verification code that is sent via SMS to you."
    }];
    inquirer.prompt(schema).then(answers => {
      resolve(answers.code);
    });
  });
  return code;
}

// Prompt for Filter
async function confirmFilter() {
  const enableFilter = await new Promise((resolve, reject) => {
    const schema =
    [{
      type: 'confirm',
      name: 'filter',
      message: "Do you want to filter your trips ?",
      default: true
    }];
    inquirer.prompt(schema).then(answers => {
      resolve(answers.filter);
    })
  });
  return enableFilter;
}

// Prompt to get Month
async function getMonth(list) {
  const filterSelected = await new Promise((resolve, reject) => {
    const schema =
    [{
      type: 'list',
      name: 'filteroption',
      message: "Choose month you want to filter.",
      choices: list
    }];
    inquirer.prompt(schema).then(answers => {
      const index = _.findIndex(list, { name: answers.filteroption });
      resolve(list[index]);
    })
  });
  return filterSelected;
}

// Prompt for Download Invoice confirmation
async function downloadInvoice() {
  const downloadInvoice = await new Promise((resolve, reject) => {
    const schema =
    [{
      type: 'confirm',
      name: 'invoice',
      message: "Do you want to download invoices for your trips ?",
      default: true
    }];
    inquirer.prompt(schema).then(answers => {
      resolve(answers.invoice);
    })
  });
  return downloadInvoice;
}


// Run scrape
async function run() {
  log(boxen(chalk.magenta('Welcome to Get Receipt !\nGet Receipt is simple tool to automate your browser and download invoices for\nyour trips from Uber for accounting purpose.\n\nFor more info visit https://github.com/break-enter/getreceipt.'),{ padding: 1, borderStyle: 'classic' }) + '\n');

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 0
  });

  const page = await browser.newPage();

  log(chalk.green('Setting user agent.'));

  // Set Random User Agent from array above
  await page.setUserAgent(desktop_agents[Math.floor(Math.random()*desktop_agents.length)]);
  log(chalk.green("Opening Uber's login screen.\n"))

  // Go to Login screen
  await page.goto('https://auth.uber.com/login?next_url=https://riders.uber.com', { waitUntil: 'domcontentloaded'});
  await page.waitFor(2 * 1000);

  // Check for Rate Limit
  const rateLimit = await page.evaluate(() => {
    if(document.querySelector('body').innerText === 'HARD') {
      return true;
    }
    return false;
  });

  if(rateLimit) {
    log(chalk.green('Oops ! Seems like site has rate limited or banned IP Address temporary. Maybe try after few hours.'));
    page.close();
    return browser.close();
  }

  log(chalk.green("Let's login to your Uber account."))


  /**
  * Login Account
  */
  await page.waitForSelector(EMAIL_SELECTOR);
  await page.click(EMAIL_SELECTOR,200);
  await page.keyboard.type(await getEmail());
  await page.click(NEXT_BUTTON);

  await page.waitFor(3 * 1000);

// If Page Selector doesn't appear means that either IP is banned temporary or it is asking for captcha.
  if(await page.$(PASSWORD_SELECTOR) === null) {
    log(chalk.green('Oops ! Seems like site is asking for captcha or banned temporary. Maybe try after few hours.'));
    page.close();
    return browser.close();
  }

  // Input Password for account
  await page.waitForSelector(PASSWORD_SELECTOR,200);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(await getPassword());
  await page.click(NEXT_BUTTON);

  await page.waitFor(2 * 1000);

  if(await page.$(SMS_SELECTOR) !== null) { // Check if we are on verification page first
    const code = await getVerificationCode();
    await page.click(SMS_SELECTOR);
    await page.keyboard.type(code);
    await page.click(VERIFY_BUTTON);
  }

  await page.waitFor(2 * 1000);

  /**
  * Main Dashboard
  */
  // await page.goto('https://riders.uber.com');

  // Enable Filter
  if(await confirmFilter()) {

    await page.waitForSelector(FILTER_TRIPS);
    await page.click(FILTER_TRIPS);

    await page.waitFor(2 * 1000);

    // Fetch list of available filters
    const filterList = await page.evaluate(() => {
      let data = [];
      const elements = document.querySelectorAll('#trip-filterer > div:nth-child(1) > div > div.grid__item.three-quarters.palm-one-whole input');

      for (const element of elements) {
        const item = {
          id: element.id,
          name: document.querySelector("[for="+element.id+"]").innerText
        }
        data.push(item);
      }

      return data;
    });

    // Select Month you want to Filter
    const filterSelected = await getMonth(filterList);

    // Apply Filter
    const FILTER_ITEM = `label[for=${filterSelected.id}]`;

    if(await page.$(FILTER_ITEM) !== null) {
      await page.click(FILTER_ITEM);
      await page.click(SUBMIT_FILTER);
    }
  }

  await page.waitFor(2 * 1000);

  log(chalk.green('Moving on ...'));

  /**
  * Download Invoices
  */
  if (await downloadInvoice()) {

    await page.waitFor(2 * 1500);

    // Add Function to Expose
    // await page.exposeFunction('getYear', text => moment(text,'MM/DD/YY').format('YYYY'));
    // await page.exposeFunction('currentYear',() => {
    //   return moment().format('YYYY');
    // });

    const DETAIL_LISTS = [];

    // Loop until next button is disabled

    while(await page.$(NEXT_PAGINATION_INACTIVE_BUTTON) === null) {

      await page.waitFor(2 * 1000);

      // Evaluate list of detail links
      const list = await page.evaluate(() => {
        const data = [];
        const detail_element = document.querySelectorAll("#trips-table div.flexbox__item.one-third.lap-one-half.separated--left.soft-double--left.hidden--palm > div.trip-info-tools > ul > li:nth-child(2) > a");
        const invoice_dates = document.querySelectorAll('#trips-table > tbody > tr > td:nth-child(2)');

        for(let [key, value] of detail_element.entries()) {
          // const year = window.getYear(invoice_dates[key].innerText);
          // console.log('current: ' + window.currentYear() + 'year: ' + year);
          // if (year === window.currentYear()) {
          //   data.push(value.href);
          // }
          data.push(value.href);
        }
        return data;
      });

      DETAIL_LISTS.push(list);

      if(await page.$(NEXT_PAGINATION) !== null) {
        await page.click(NEXT_PAGINATION);
      } else {
        continue;
      }
    }

    await page.waitFor(2 * 1000);

    // Pagination is deactivated
    if(await page.$(INACTIVE_NEXT_BUTTON) !== null && await page.$(INACTIVE_PREVIOUS_BUTTON) !== null) {
      await page.waitFor(2 * 1000);

      // Evaluate list of detail links
      const list = await page.evaluate(() => {
        const data = [];
        const detail_element = document.querySelectorAll("#trips-table div.flexbox__item.one-third.lap-one-half.separated--left.soft-double--left.hidden--palm > div.trip-info-tools > ul > li:nth-child(2) > a");
        const invoice_dates = document.querySelectorAll('#trips-table > tbody > tr > td:nth-child(2)');

        for(let [key, value] of detail_element.entries()) {
          // const year = window.getYear(invoice_dates[key].innerText);
          // if (year === window.currentYear()) {
          //   data.push(value.href);
          // }
          data.push(value.href);
        }
        return data;
      });

      DETAIL_LISTS.push(list);
    }

    if(_.flattenDeep(DETAIL_LISTS).length > 10) {
      log(chalk.green(`\nWhoa, ${_.flattenDeep(DETAIL_LISTS).length} invoices? Put your feet up, this will take a while, my friend.\n`));
    } else if (_.flattenDeep(DETAIL_LISTS).length <= 2) {
      log(chalk.green(`\nRunning a script for just ${_.flattenDeep(DETAIL_LISTS).length} invoices? Now that's just lazy, but we won't judge.\n`));
    } else {
      log(chalk.green(`\nWhoa,we found ${_.flattenDeep(DETAIL_LISTS).length} invoices ! Put your feet up and relax while it processes.\n`));
    }

    const spinner = ora('Fetching ' + _.flattenDeep(DETAIL_LISTS).length + ' invoices. Please wait .....').start();

    // Loop through each link and download invoice.
    for(let [key, value] of _.flattenDeep(DETAIL_LISTS).entries()) {
      spinner.text = `Fetching ${key + 1}/${_.flattenDeep(DETAIL_LISTS).length} - ${value}`;

      await page.goto(value, { waitUntil: 'domcontentloaded'});

      await page.waitFor(1 * 1000);

      // Check if month is set. If yes then store all invoices in that folder.
      const month = await page.evaluate(() => {
        const timedate = document.querySelector('#slide-menu-content > div > div.flexbox__item.flexbox__item--expand > div > div > div.flexbox__item.four-fifths.page-content > div.page-lead > div').innerText;
        return timedate;
      });

      // Separate out words into array
      const splittedMonth = _.words(month);
      await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: `./invoices/${splittedMonth[4]}-${splittedMonth[6]}`});

      // Check if request button is hidden
      const invoiceRequest = await page.evaluate(() => {
        return document.querySelector('#data-invoice-btn-request') && document.querySelector('#data-invoice-btn-request').classList.contains('hidden');
      });

      // Check if request invoice button is hidden. Then go ahead download it.
      if(invoiceRequest) {
        await page.waitFor(1 * 1000);
        await page.click(DOWNLOAD_INVOICE);
      }

      await page.waitFor(1 * 2000);
    }

    spinner.stop('All Invoices downloaded !');
  }

  log(chalk.green('All Invoices downloaded. Check your invoices folder to see all Thanks for using the tool !'));

  await page.waitFor(1 * 2000);

  browser.close();
}

run();
