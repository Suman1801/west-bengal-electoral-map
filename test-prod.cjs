const { chromium } = require('playwright');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

const server = app.listen(3001, async () => {
  console.log('Server running on 3001');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('Page error:', err.toString());
  });
  
  page.on('console', msg => {
    console.log('Console:', msg.type(), msg.text());
  });
  
  try {
    await page.goto('http://127.0.0.1:3001', { waitUntil: 'networkidle' });
    console.log('Done');
  } catch (e) {
    console.log("Goto error:", e);
  }
  
  await browser.close();
  server.close();
});
