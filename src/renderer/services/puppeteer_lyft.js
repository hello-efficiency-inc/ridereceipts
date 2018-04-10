import puppeteer from 'puppeteer'
import Store from 'electron-store'
import jetpack from 'fs-jetpack'
import { ipcRenderer } from 'electron'

const CHROME_NOT_FOUND = 'CHROME_NOT_FOUND'

// Launch Puppeteer
async function launch (puppeteer, exec) {
  return puppeteer.launch({
    headless: true,
    timeout: 0,
    executablePath: exec,
    args: [
      '--disable-gpu'
    ]
  })
}

export default async function (email, year, month, invoiceDate, html) {
  const store = new Store()
  const documentDir = jetpack.cwd(store.get('invoicePath'))
  let exec = store.get('chromePath')

  // If executable path not found then throw error
  if (!jetpack.exists(exec)) {
    ipcRenderer.send('form', CHROME_NOT_FOUND)
    return
  }

  const browser = await launch(puppeteer, exec)
  store.set('processPID', browser.process().pid) // Store process ID to kill when app quits

  const page = await browser.newPage()
  page.setContent(html)

  page.waitFor(1000)

  if (!jetpack.exists(documentDir.path(`${documentDir.path()}/${email}/Lyft/${year}/${month}/${invoiceDate}/`))) {
    jetpack.dir(documentDir.path(`${documentDir.path()}/${email}/Lyft/${year}/${month}/${invoiceDate}/`))
  }

  await page.emulateMedia('print')
  const receiptFilePath = `${documentDir.path()}/${email}/Lyft/${year}/${month}/${invoiceDate}/Receipt-${invoiceDate}.pdf`
  await page.pdf({
    path: receiptFilePath,
    format: 'A4',
    printBackground: true
  })

  store.delete('browserEndpoint')
  await browser.close()
}
