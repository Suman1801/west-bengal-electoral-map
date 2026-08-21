const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('PAGE ERROR STACK:', err.stack || err));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text(), msg.location());
  });
  await page.goto('http://127.0.0.1:3000');
  await page.waitForTimeout(2000);
  await browser.close();
})();
