<p align="center"><img src="/uber-run.png" alt="Uber Run" width="150"></p>

<p align="center">
<a href="https://travis-ci.org/mrgodhani/uberrun">
<img src="https://travis-ci.org/mrgodhani/uberrun.svg?branch=master">
</a>
<a href="https://codeclimate.com/github/mrgodhani/uberrun/maintainability">
<img src="https://api.codeclimate.com/v1/badges/b1b6cc14751a2e62aa4b/maintainability" />
</a>
<a href="https://david-dm.org/mrgodhani/uberrun">
<img src="https://david-dm.org/mrgodhani/uberrun.svg" />
</a>
<a href="https://david-dm.org/mrgodhani/uberrun?type=dev" title="devDependencies status"><img src="https://david-dm.org/mrgodhani/uberrun/dev-status.svg"/></a>
<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5GHVYY9WEL78Y">
 <img src="https://img.shields.io/badge/Donate-PayPal-green.svg"/>
</a>
<a href="https://www.producthunt.com/posts/uber-run">
  <img src="https://img.shields.io/badge/producthunt-vote-orange.svg">
</a>
</p>

> Simple automation desktop app to download and organize your tax invoices from Uber.


![screenshot](/uberrun-app.png)

### Download

MacOS, Windows and Linux - [https://github.com/mrgodhani/uberrun/releases](https://github.com/break-enter/uberrun/releases)

## Why

Uber Run is essential for anyone who relies on Uber for business travel. Whether you’re self-employed or get reimbursed by your employer for travel, you’ll likely need proper tax invoices for accounting purposes.

This was a major pain point for us every year around tax season. Since the current Uber website does not allow you to download all of your invoices for the year at once, you have to manually download, rename, and organize each of your invoices. So you’re either doing it one by one, or if you have a business profile, you still have to download them one month at a time. Uber’s monthly business travel report is great for keeping track of your trips, but these aren’t actual invoices.

We created Uber Run to address this painfully inefficient process, and now we’re sharing it with everyone who could benefit from this time-saving tool.

## Solution

Automation! Uber Run is an open-source desktop app that automates the process of downloading, renaming, and organizing your Uber invoices. Rather than logging into your Uber account to scan through each of your trips and manually download each invoice, Uber Run will automatically do it for you.

Your invoices will be named according to the date and time of your trip, and organized by user account, year and month, in neat and tidy folders on your computer.

## Requirements

Since Electron is not 100% headless, we're using [Google Puppeteer](https://github.com/GoogleChrome/puppeteer) to scrape the invoices from your Uber account.

Uber Run requires Chromium to operate. Please download [Chromium](https://download-chromium.appspot.com/) and extract folder on your desktop.

Uber Run works on both Mac and PC. Please note we built this on Mac, so it may still have some details to iron out on PC.

## Limitations

Uber Run can only download the invoices that exist in your Uber account. Invoices that are cancelled, have not been issued, or have a "Request Invoice" button (as in Uber Eats, and travel in certain countries) will not download.

Since Uber Run scrapes your user account on the website, you may be halted by Uber's rate limiting. Please do not run the app more than once in the same hour. If your IP address gets banned, don’t panic, this is only temporary and you’ll be able to access Uber’s website again in an hour or so. We recommend downloading all the invoices you need in one go. After all, that’s why we built it!

Currently Uber Run cannot distinguish between business and personal invoices. Our recommended workaround is to use Uber’s monthly business travel report to cross reference with all of the invoices from Uber Run and delete the ones you don’t intend to claim for your taxes or company reimbursement. Uber Run automatically renames all of your invoices by the date and time of the trip, and organizes them by month in folders, so it’s easier to tell what’s what.

## Security

Uber Run does not store your login credentials, personal information or any other data. This application operates without a database and it is solely automating on the Chromium browser as you type.

Simply put, using Uber Run is no different security-wise than if you were to log into your Uber account manually through your regular browser. By using Uber Run, you’re essentially telling the browser to do this for you automatically.

For Mac users: Since Uber Run is not available in the App Store, you may need to override your security settings in order to open it. Please follow these [instructions](https://support.apple.com/kb/PH25088?locale=en_US).

## Features

- [x] Categorized by User Account
- [x] Categorized by Year and Month
- [x] Invoices are renamed by date and timestamp. E.g. Jan-30-2018-9am.PDF
- [x] Option to filter invoices by a specific month(s) or year(s)
- [x] Supported on all Platforms i.e Windows, Mac & Linux
- [x] Take pdf screenshot of receipts of your trip page.
- [ ] Automatically separate business from personal invoices
- [x] Configurable path to save invoices

## Developer Notes

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# build electron application for cross platform
npm run build -mwl (i.e m - macos , w - windows & l - Linux)


# lint all JS/Vue component files in `src/`
npm run lint

```

*Open Source projects used*

- [Electron Vue](https://github.com/SimulatedGREG/electron-vue)
- [Google Puppeteer](https://github.com/GoogleChrome/puppeteer)
- [Bootstrap](https://getbootstrap.com/)

## Credits

- Adi Ofir ([Break and Enter](https://www.breakenter.com)) for logo and app design.
- Meet Godhani ([@mrgodhani](https://twitter.com/mrgodhani)) for all programming.

## Support / Contribution

Please feel free to give us suggestions or report a bug by creating a [new issue](https://github.com/break-enter/uberrun/issues) via Github or messaging on  Twitter: [@mrgodhani](https://twitter.com/mrgodhani).

## License
[MIT](https://github.com/break-enter/uberrun/blob/master/LICENSE)
