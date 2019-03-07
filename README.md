<p align="center"><img src="static/ride-receipts.svg" alt="Ride Receipts" width="350"></p>

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
<a href="https://www.producthunt.com/posts/uber-run">
  <img src="https://img.shields.io/badge/producthunt-vote-orange.svg">
</a>
<a title="MadeWithVueJs.com Shield" href="https://madewithvuejs.com/p/ride-receipts/shield-link"> <img src="https://madewithvuejs.com/storage/repo-shields/328-shield.svg"/></a>
</p>

> Simple automation desktop app to download and organize your receipts from Uber and Lyft.


![screenshot](/ridereceipt-app.png)

### Download

To download Ride Receipts or purchase Ride Receipts PRO, please visit [https://www.ridereceipts.io](https://www.ridereceipts.io)

## Features

- [x] Categorized by User Account
- [x] Categorized by Year and Month
- [x] Invoices are renamed by date and timestamp. E.g. Jan-30-2018-9am.PDF
- [x] Option to filter invoices by a specific month(s) or year(s)
- [x] Supported on Windows & Mac
- [x] Lyft Integration
- [x] Expenditure stat of your trip depending on your filter you choose
- [x] Categorizes **Uber** and **Uber Eats** receipts
- [ ] Outlook integration for Lyft

## Why

Ride Receipts is essential for anyone who relies on Uber/Lyft for business travel. Whether you’re self-employed or get reimbursed by your employer for travel, you’ll likely need proper tax invoices for accounting purposes.

This was a major pain point for us every year around tax season. Since the current Uber website does not allow you to download all of your receipts for the year at once, you have to manually download, rename, and organize each of your invoices. So you’re either doing it one by one, or if you have a business profile, you still have to download them one month at a time. Uber’s monthly business travel report is great for keeping track of your trips, but these aren’t actual receipts.

We created Ride Receipts to address this painfully inefficient process, and now we’re sharing it with everyone who could benefit from this time-saving tool.

## Solution

Automation! Ride Receipts is an open-source desktop app that automates the process of downloading, renaming, and organizing your Uber/Lyft receipts. Rather than logging into your Uber account to scan through each of your trips and manually download each receipt, Ride Receipts will automatically do it for you.

Your invoices will be named according to the date and time of your trip, and organized by user account, year and month, in neat and tidy folders on your computer.

## Requirements

For Uber and Lyft we utilize Gmail API to scan your email only for **receipts**.
Make sure your system has latest Chrome Browser installed (v69 or above).

Ride Receipts works on both Mac and PC.

## Security

Ride Receipts does not store your login credentials, personal information or any other data. This application operates without a database. It only scans email for **receipts** with **read-only** access.

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
- [Chrome Launcher](https://github.com/GoogleChrome/chrome-launcher)
- [Google Puppeteer](https://github.com/GoogleChrome/puppeteer)
- [Bootstrap](https://getbootstrap.com/)

## Support / Contribution

Please feel free to give us suggestions or report a bug by creating a [new issue](https://github.com/ridereceipts/ridereceipts/issues) via Github or messaging on  Twitter: [@ridereceipts](https://twitter.com/ridereceipts). You can also email us at [hello@ridereceipts.io](hello@ridereceipts.io).

## License
License by default is [LGPLv3](https://github.com/ridereceipts/ridereceipts/blob/master/LICENSE). After purchase please refer [COMM-LICENSE](https://github.com/ridereceipts/ridereceipts/blob/master/COMM-LICENSE) is applied
