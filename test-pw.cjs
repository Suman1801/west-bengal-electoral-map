const { chromium } = require('playwright');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

const server = app.listen(3002, async () => {
  console.log('Server running on 3002');
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('pageerror', err => {
      console.log('PAGE ERROR STACKTRACE:', err.stack || err.toString());
    });
    
    await page.goto('http://127.0.0.1:3002', { waitUntil: 'networkidle' });
    console.log('Done');
    await browser.close();
  } catch(e) {
    console.log(e);
  } finally {
    server.close();
  }
});
