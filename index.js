const puppeteer = require('puppeteer');
const inquire = require('inquirer');
const CREDS = require('./creds');
const _ = require('lodash');

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

const questions = [
  {
    type: 'input',
    name: 'verification_code',
    message: 'Please enter verification code"'
  }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.setUserAgent(desktop_agents[Math.floor(Math.random()*desktop_agents.length)]);

  await page.goto('https://auth.uber.com/login/');

  const EMAIL_SELECTOR = '#useridInput';
  const PASSWORD_SELECTOR = '#password';
  const SMS_SELECTOR ='#verificationCode';
  const NEXT_BUTTON = '#app-body > div > div:nth-child(1) > form > button';

  // Input Email/ Username
  await page.click(EMAIL_SELECTOR,200);
  await page.keyboard.type(CREDS.email);
  await page.click(NEXT_BUTTON);

  await sleep(1000);

  // Input Password for account
  await page.waitForSelector(PASSWORD_SELECTOR,200);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(CREDS.password);
  await page.click(NEXT_BUTTON);

  await sleep(1000);

  // Input SMS verification
  await page.waitForSelector(SMS_SELECTOR);
  inquire.prompt(questions).then(answers => {
    console.log(answers);
  });


  await page.screenshot({path: 'screenshots/uber.png'});

  browser.close();
}

run();
