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
}


// Run scrape
async function run() {
  log(chalk.green.bold('Welcome to Get Receipt !\n'));
  log(boxen(chalk.magenta('Get Receipt is simple tool to automate your browser and download invoices for\nyour trips from Uber for accounting purpose.'),{ padding: 1 }) + '\n');

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
  await page.goto('https://auth.uber.com/login/', { waitUntil: 'domcontentloaded'});
  await page.waitFor(2 * 1000);

  log(chalk.green("Let's login to your Uber account."))


  /**
  * Login Account
  */
  await page.waitForSelector(EMAIL_SELECTOR);
  await page.click(EMAIL_SELECTOR,200);
  await page.keyboard.type(await getEmail());
  await page.click(NEXT_BUTTON);

  await page.waitFor(2 * 1000);

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
  await page.goto('https://riders.uber.com');

  await page.waitFor(2 * 1000);

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

    SELECTED_MONTH = filterSelected.name;

    // Apply Filter
    const FILTER_ITEM = "label[for="+filterSelected.id+"]";

    await page.waitFor(2 * 1000);

    await page.click(FILTER_ITEM);
    await page.click(SUBMIT_FILTER);
  }

  await page.waitFor(2 * 1000);

  log(chalk.green('Moving on ...'));

  /**
  * Download Invoices
  */
  if (await downloadInvoice()) {

    await page.waitFor(2 * 1000);

    const DETAIL_LISTS = [];

    // Loop until next button is disabled

    while(await page.$(NEXT_PAGINATION_INACTIVE_BUTTON) === null) {

      await page.waitFor(2 * 1000);

      // Evaluate list of detail links
      const list = await page.evaluate(() => {
        const data = [];
        const detail_element = document.querySelectorAll("#trips-table div.flexbox__item.one-third.lap-one-half.separated--left.soft-double--left.hidden--palm > div.trip-info-tools > ul > li:nth-child(2) > a");

        for(const detail of detail_element) {
          data.push(detail.href);
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

        for(const detail of detail_element) {
          data.push(detail.href);
        }
        return data;
      });

      DETAIL_LISTS.push(list);
    }

    log(chalk.green("We have " + _.flattenDeep(DETAIL_LISTS).length + " no. of Invoices !"));

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

  log(chalk.green('All Invoices downloaded. Thanks for using the tool !'));

  await page.waitFor(1 * 2000);

  browser.close();
}

run();
