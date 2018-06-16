import puppeteer from 'puppeteer'
import _ from 'lodash'
import got from 'got'
import Store from 'electron-store'

export default async function (path, cb) {
  const store = new Store()
  const fetcher = await puppeteer.createBrowserFetcher({
    path: path
  })
  const platform = await fetcher.platform()
  const latestRevision = await got(`https://storage.googleapis.com/chromium-browser-snapshots/${_.capitalize(platform)}/LAST_CHANGE`)
  const downloaded = await fetcher.download(latestRevision.body, (db, tb) => {
    const progress = _.ceil(_.divide(db, tb) * 100)
    const finished = progress === 100
    cb(progress, finished)
  })
  store.set('chromePath', downloaded.executablePath)
}
