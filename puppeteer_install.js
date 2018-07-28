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
    const revision = require('./node_modules/puppeteer/package.json').puppeteer.chromium_revision;
    const revisionInfo = fetcher.revisionInfo(revision);
    await fetcher.download(revisionInfo.revision)
  })
})();
