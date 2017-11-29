# Get Receipt #

Get receipt is an command line application made using [Google Puppeteer](https://github.com/GoogleChrome/puppeteer), a headless chrome node library mainly used for web scraping and browser automation.

- *Problem*

As a user it is always a pain to download all invoices in one go from Uber for tax reasons. According to their current UI, you have to manually go each trip detail and download invoice.

- *Solution*

Automation ! We created a command line script which would act as a robot login from your behalf and download all the invoices without you interacting with browser. If you choose filters it would also categorize all the invoices in monthly folder.


### Demo

![img](demo.gif)

### Getting Started

Before we start , we need following below tools installed. Head over to their websites and install them.

- [Node 8.+](https://nodejs.org)

For best experience in Mac. It is recommended to use [iTerm](https://www.iterm2.com/) instead of default terminal in Mac OS.

### Usage

```
git clone https://mgodhani@bitbucket.org/breakenter/getreceipt.git

cd getreceipt

npm install

```
After running commands above, run following below:
```
npm start

```

All downloaded invoices would be available inside `invoices` folder.

### Note

This project does not store any kind of data anywhere. It is a project without any database involved.

### Caution

- Since this program scrapes website. You might be halted by Uber's rate limiting. Try to use command line app with having a good amount of idle time gap.

![img](ratelimit.png)

### Authors & Contributors

- Meet Godhani
- Adi Ofir

### To do

- Coming up with desktop application with user interface vs command line application.

### Support / Contribution

Please feel free to give suggestion or report bug by [creating issue](https://github.com/break-enter/getreceipt/issues).


### License

[MIT License](LICENSE)
