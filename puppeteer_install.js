const puppeteer = require('puppeteer');
const _ = require('lodash');
const got = require('got');
const rimraf = require('rimraf');

(async() => {
  const platformList = [
    'mac',
    'win32',
    'win64'
  ]
  await new Promise(fulfill => rimraf('./node_modules/puppeteer/.local-chromium/**/*', fulfill));
  platformList.forEach(async (platform) => {
    const fetcher = await puppeteer.createBrowserFetcher({
      platform: platform
    })
    // console.log(`https://storage.googleapis.com/chromium-browser-snapshots/${_.capitalize(platform)}/LAST_CHANGE`)
    // const latestRevision = await got(`https://storage.googleapis.com/chromium-browser-snapshots/Mac/LAST_CHANGE`)
    await fetcher.download('576753')
  })
})();
