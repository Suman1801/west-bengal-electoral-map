const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const mapData = await page.evaluate(() => {
     let year = document.querySelector('select')?.value;
     let firstPathFill = document.querySelector('path.leaflet-interactive')?.getAttribute('fill');
     let noDataCount = Array.from(document.querySelectorAll('path.leaflet-interactive')).filter(p => p.getAttribute('fill') === '#cbd5e1' || p.getAttribute('fill') === '#334155').length;
     return {
         year,
         firstPathFill,
         noDataCount,
         paths: document.querySelectorAll('path.leaflet-interactive').length
     };
  });
  console.log("Map Info:", mapData);

  await browser.close();
})();
