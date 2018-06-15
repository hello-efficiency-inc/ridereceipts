import puppeteer from 'puppeteer'
import _ from 'lodash'
import got from 'got'
import jetpack from 'fs-jetpack'
import Store from 'electron-store'
import fs from 'fs'
import { remote } from 'electron'

export default async function (cb) {
  const useDataDir = jetpack.cwd(remote.app.getAppPath()).cwd(remote.app.getPath('userData'))
  const dirChrome = jetpack.exists(useDataDir.path('chrome'))
  const store = new Store()
  if (!dirChrome) {
    fs.mkdir(useDataDir.path('chrome'))
  }
  const fetcher = await puppeteer.createBrowserFetcher({
    path: useDataDir.path('chrome')
  })
  const platform = await fetcher.platform()
  const latestRevision = await got(`https://storage.googleapis.com/chromium-browser-snapshots/${_.capitalize(platform)}/LAST_CHANGE`)
  fs.readdir(useDataDir.path('chrome'), async function (err, files) {
    let progress = 100
    let finished = true
    if (err) {}
    if (!files.length) {
      const downloaded = await fetcher.download(latestRevision.body, (db, tb) => {
        progress = _.ceil(_.divide(db, tb) * 100)
        finished = progress === 100
        cb(progress, finished)
      })
      store.set('chromePath', downloaded.executablePath)
    }
    cb(progress, finished)
  })
}
