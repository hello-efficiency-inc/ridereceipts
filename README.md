<p align="center"><img src="/ride-receipts.png" alt="Ride Receipts" width="350"></p>

<p align="center">
<a href="https://travis-ci.org/ridereceipts/ridereceipts">
<img src="https://travis-ci.org/ridereceipts/ridereceipts.svg?branch=master">
</a>
<a href="https://codeclimate.com/github/ridereceipts/ridereceipts/maintainability">
<img src="https://api.codeclimate.com/v1/badges/8b850bbab50f0a55b2ed/maintainability" />
</a>
<a href="https://david-dm.org/ridereceipts/ridereceipts">
<img src="https://david-dm.org/ridereceipts/ridereceipts.svg" />
</a>
<a href="https://david-dm.org/ridereceipts/ridereceipts?type=dev" title="devDependencies status"><img src="https://david-dm.org/ridereceipts/ridereceipts/dev-status.svg"/></a>
<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5GHVYY9WEL78Y">
 <img src="https://img.shields.io/badge/Donate-PayPal-green.svg"/>
</a>
<a href="https://www.producthunt.com/posts/uber-run">
  <img src="https://img.shields.io/badge/producthunt-vote-orange.svg">
</a>
<a title="MadeWithVueJs.com Shield" href="https://madewithvuejs.com/p/ride-receipts/shield-link"> <img src="https://madewithvuejs.com/storage/repo-shields/328-shield.png"/></a>
</p>

> Simple automation desktop app to download and organize your tax invoices from Uber and Lyft.


![screenshot](/ridereceipt-app.png)

### Download

To download Ride Receipts, please visit [https://www.ridereceipts.io](https://www.ridereceipts.io)

## Features

- [x] Categorized by User Account
- [x] Categorized by Year and Month
- [x] Invoices are renamed by date and timestamp. E.g. Jan-30-2018-9am.PDF
- [x] Option to filter invoices by a specific month(s) or year(s)
- [x] Supported on all Platforms i.e Windows, Mac & Linux
- [x] Take pdf screenshot of receipts of your trip page.
- [x] Lyft Integration
- [x] Expenditure stat of your trip depending on your filter you choose
- [x] Optional Debug mode (Default: Off) to see actually what is going on / how it is working.

**Note**: When debug mode is turned on screenshots/pdf of receipts won't work. Purpose of this preference is so that you can point out to us where it is going on wrong or you are aware about it how it is working.
Debug mode won't work with Lyft. It is mainly for Uber.
- [ ] Outlook integration for Lyft
- [ ] Automatically separate business from personal invoices (Maybe only for Lyft)

## Why

Ride Receipts is essential for anyone who relies on Uber/Lyft for business travel. Whether you’re self-employed or get reimbursed by your employer for travel, you’ll likely need proper tax invoices for accounting purposes.

This was a major pain point for us every year around tax season. Since the current Uber website does not allow you to download all of your invoices for the year at once, you have to manually download, rename, and organize each of your invoices. So you’re either doing it one by one, or if you have a business profile, you still have to download them one month at a time. Uber’s monthly business travel report is great for keeping track of your trips, but these aren’t actual invoices.

We created Ride Receipts to address this painfully inefficient process, and now we’re sharing it with everyone who could benefit from this time-saving tool.

## Solution

Automation! Ride Receipts is an open-source desktop app that automates the process of downloading, renaming, and organizing your Uber invoices. Rather than logging into your Uber account to scan through each of your trips and manually download each invoice, Ride Receipts will automatically do it for you.

Your invoices will be named according to the date and time of your trip, and organized by user account, year and month, in neat and tidy folders on your computer.

## Requirements

Since Electron is not 100% headless, we're using [Google Puppeteer](https://github.com/GoogleChrome/puppeteer) to scrape the invoices from your Uber account. For Lyft we utilize Gmail API to scan your email only for **Lyft receipts**.

Ride Receipts works on both Mac and PC.

## Limitations (Uber)

Ride Receipts scrapes your user account on the website, you may be halted by Uber's rate limiting. Please do not run the app more than once in the same hour. If your IP address gets banned, don’t panic, this is only temporary and you’ll be able to access Uber’s website again in an hour or so. We recommend downloading all the invoices you need in one go. After all, that’s why we built it!

Currently Ride Receipts cannot distinguish between business and personal invoices. Our recommended workaround is to use Uber’s monthly business travel report to cross reference with all of the invoices from Ride Receipts and delete the ones you don’t intend to claim for your taxes or company reimbursement. Ride Receipts automatically renames all of your invoices by the date and time of the trip, and organizes them by month in folders, so it’s easier to tell what’s what.

## Security

Ride Receipts does not store your login credentials, personal information or any other data. This application operates without a database and it is solely automating on the Chromium browser as you type for Uber and scanning email only for **receipts** if you choose Lyft.

Simply put, using Ride Receipts is no different security-wise than if you were to log into your Uber account manually through your regular browser. By using Ride Receipts, you’re essentially telling the browser to do this for you automatically.


## Developer Notes

#### Build Setup

``` bash
# install dependencies
npm install

# Navigate to renderer directory and copy config example to config.js and set Google Client Id and Outlook Id
cp config.example.js config.js

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# build electron application for cross platform
npm run build -mwl (i.e m - macos , w - windows & l - Linux)


# lint all JS/Vue component files in `src/`
npm run lint

```

## Powered by

- [Electron Vue](https://github.com/SimulatedGREG/electron-vue)
- [Vue](https://www.vuejs.org)
- [DeathByCaptcha](http://www.deathbycaptcha.com)
- [Google Puppeteer](https://github.com/GoogleChrome/puppeteer)
- [Bootstrap](https://getbootstrap.com/)

## Credits

- Adi Ofir ([Break and Enter](https://www.instagram.com/break.enter)) for logo and app design.
- Meet Godhani ([@mrgodhani](https://twitter.com/mrgodhani)) for all programming.

## Support / Contribution

Please feel free to give us suggestions or report a bug by creating a [new issue](https://github.com/ridereceipts/ridereceipts/issues) via Github or messaging on  Twitter: [@ridereceipts](https://twitter.com/ridereceipts). You can also email us at [hello@ridereceipts.io](hello@ridereceipts.io).

## License
[MIT](https://github.com/ridereceipts/ridereceipts/blob/master/LICENSE)
