const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    console.log('Page error:', err.toString());
    console.log('Stack trace:', err.stack);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await browser.close();
})();
