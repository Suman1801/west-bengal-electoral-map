const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('pageerror', err => {
      console.log('PAGE ERROR STACKTRACE:', err.stack || err.toString());
    });
    
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
    console.log('Done');
    await browser.close();
  } catch(e) {
    console.log(e);
  }
})();
