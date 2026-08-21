const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('Page error: ', err.toString());
  });
  
  page.on('error', err => {
    console.log('Error: ', err.toString());
  });

  page.on('console', msg => {
    console.log('Console:', msg.type(), msg.text());
  });
  
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  await browser.close();
})();
