const puppeteer = require('puppeteer');
const CREDS = require('./creds');

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });

  const page = await browser.newPage();

  await page.goto('https://auth.uber.com/login/');
  await page.screenshot({path: 'screenshots/uber.png'});

  browser.close();
}

run();
