#!/usr/bin/env node
'use strict';

// Required Packages
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');
const chalk = require('chalk');
const boxen = require('boxen');
const _ = require('lodash');
const log = console.log;

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
const VERIFY_BUTTON = '#app-body > div > div > form > button';
const FILTER_TRIPS = '#slide-menu-content > div > div.flexbox__item.flexbox__item--expand > div > div > div.flexbox__item.four-fifths.page-content > div.hidden--palm > div > div > div.flexbox__item.one-third.text--left > a';
const SUBMIT_FILTER = '#trip-filterer-button';


async function run() {
  log(chalk.green.bold('Welcome to Get Receipt !\n'));
  log(boxen(chalk.magenta('Get Receipt is simple tool to automate your browser and download invoices for\nyour trips from Uber for accounting purpose.'),{ padding: 1 }) + '\n');
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  log(chalk.green('Setting user agent.'));

  // Set Random User Agent from array above
  await page.setUserAgent(desktop_agents[Math.floor(Math.random()*desktop_agents.length)]);
  log(chalk.green("Opening Uber's login screen.\n\n"))


  // Go to Login screen
  await page.goto('https://auth.uber.com/login/');
  await page.waitFor(2 * 1000);


  log(chalk.green("Let's login to your Uber account."))
  /**
  * Login Account
  */
  // Input Email/ Username
  await page.waitForSelector(EMAIL_SELECTOR);
  // Enter Email
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
  await page.click(EMAIL_SELECTOR,200);
  await page.keyboard.type(email);
  await page.click(NEXT_BUTTON);

  await page.waitFor(2 * 1000);

  // Input Password for account
  await page.waitForSelector(PASSWORD_SELECTOR,200);

  // Enter Password
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
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(password);
  await page.click(NEXT_BUTTON);

  await page.waitFor(2 * 1000);

  // Input SMS verification
  if(await page.$(SMS_SELECTOR) !== null) { // Check if we are on verification page first
    // Enter 2 Factor Mobile Verification Code
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
    })
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


  await page.waitForSelector(FILTER_TRIPS);
  await page.click(FILTER_TRIPS);

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

// Enable Filter
  if(enableFilter) {

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
    const filterSelected = await new Promise((resolve, reject) => {
      const schema =
      [{
        type: 'list',
        name: 'filteroption',
        message: "Choose month you want to filter.",
        choices: filterList
      }];
      inquirer.prompt(schema).then(answers => {
        const index = _.findIndex(filterList, { name: answers.filteroption });
        resolve(filterList[index].id);
      })
    });

    // Apply Filter

    const FILTER_ITEM = "label[for="+filterSelected+"]";
    
      await page.waitFor(2 * 1000);
    
      await page.click(FILTER_ITEM);
      await page.click(SUBMIT_FILTER);
  }

  await page.waitFor(2 * 1000);

  log(chalk.green('Moving on ...'));

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


  if (downloadInvoice) {

    await page.waitFor(2 * 1000);

    const DETAIL_LISTS = [];

    while(await page.$(NEXT_PAGINATION) != null) {

      const list = await page.evaluate(() => {
        const data = [];
        const detail_element = document.querySelectorAll("#trips-table div.flexbox__item.one-third.lap-one-half.separated--left.soft-double--left.hidden--palm > div.trip-info-tools > ul > li:nth-child(2) > a");
        
              for(const detail of detail_element) {
                data.push(detail.href);
              }
          return data;
      });
      DETAIL_LISTS.push(list);

      await page.waitFor(2 * 1000);
      await page.click(NEXT_PAGINATION);
    } 
    log(DETAIL_LISTS);
    log(chalk.green("We have " + _.flattenDeep(DETAIL_LISTS).length + " no. of Invoices !"));
  }




  // Click on filter and Apply
  // Collect All Detail Links and count invoices in Total
  // Loop through each link and download invoice.

  await page.screenshot({path: 'screenshots/uber.png'});

  page.close();
  browser.close();
}

run();
