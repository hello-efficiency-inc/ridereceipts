'use strict';

const puppeteer = require('puppeteer');
const prompt = require('prompt');
const _ = require('lodash');

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

prompt.start();

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();
  const self = this;

  await page.setUserAgent(desktop_agents[Math.floor(Math.random()*desktop_agents.length)]);

  await page.goto('https://auth.uber.com/login/');

  // Input Email/ Username
  await page.waitForSelector(EMAIL_SELECTOR);
  // Enter Email
  const email = await new Promise((resolve, reject) => {
    prompt.get(['email'], function(err, result){
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

  await page.goto('https://riders.uber.com');

  await page.screenshot({path: 'screenshots/uber.png'});

  page.close();
  browser.close();
}

run();
