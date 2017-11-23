'use strict';

// Required Packages
const puppeteer = require('puppeteer');
const prompt = require('prompt');
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
const VERIFY_BUTTON = '#app-body > div > div > form > button';
const FILTER_TRIPS = '#slide-menu-content > div > div.flexbox__item.flexbox__item--expand > div > div > div.flexbox__item.four-fifths.page-content > div.hidden--palm > div > div > div.flexbox__item.one-third.text--left > a';

// Sleep/delay Function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

prompt.start();

async function run() {
  log(chalk.green.bold('Welcome to Get Receipt !'));
  log(boxen(chalk.magenta('Get Receipt is simple tool to automate your browser and download invoices for your trips from Uber for accounting purpose.'),{ padding: 1 }) + '\n');
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  log(chalk.green('Setting user agent.'));
// Set Random User Agent from array above
  await page.setUserAgent(desktop_agents[Math.floor(Math.random()*desktop_agents.length)]);

  log(chalk.green("Opening Uber's login screen.\n\n\n"))
// Go to Login screen
  await page.goto('https://auth.uber.com/login/');


log(chalk.green("Let's login to your uber account."))
/**
 * Login Account
 */
  // Input Email/ Username
  await page.waitForSelector(EMAIL_SELECTOR);
  // Enter Email
  const email = await new Promise((resolve, reject) => {
    prompt.get({
      properties: {
        email: {
          description: 'Enter your email'
        }
      }
    }, function(err, result){
      resolve(result.email);
    })
  });
  await page.click(EMAIL_SELECTOR,200);
  await page.keyboard.type(email);
  await page.click(NEXT_BUTTON);

  await sleep(1000);

  // Input Password for account
  await page.waitForSelector(PASSWORD_SELECTOR,200);

  // Enter Password
  const password = await new Promise((resolve, reject) => {
    prompt.get({
      properties: {
        password: {
          description: 'Enter your password',
          hidden: true
        }
      }
    }, function(err, result){
      resolve(result.password);
    })
  });
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(password);
  await page.click(NEXT_BUTTON);

  await sleep(1000);


  // Input SMS verification
  await page.waitForSelector(SMS_SELECTOR);

  // Enter 2 Factor Mobile Verification Code
  const code =  await new Promise((resolve, reject) => {
    prompt.get({
      properties: {
        verification_code: {
          description: 'Please enter verification code',
          required: true
        }
      }
    }, function(err, result) {
      resolve(result);
    });
  })
  await page.click(SMS_SELECTOR);
  await page.keyboard.type(code.verification_code);
  await page.click(VERIFY_BUTTON);


  /**
   * Main Dashboard
   */
  await page.goto('https://riders.uber.com');



  await page.screenshot({path: 'screenshots/uber.png'});

  page.close();
  browser.close();
}

run();
