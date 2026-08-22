const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  
  // Expose the global state if possible, or just wait
  await new Promise(r => setTimeout(r, 3000));
  
  // Try to query react fiber or DOM to see if map is rendered
  const mapData = await page.evaluate(() => {
     return {
         html: document.body.innerHTML.substring(0, 500),
         hasMap: !!document.querySelector('.leaflet-container'),
         yearSelector: document.querySelector('select')?.value,
         geoJsonPaths: document.querySelectorAll('path.leaflet-interactive').length
     };
  });
  console.log("Map Data from page:", mapData);

  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
