const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const sankeyHtml = await page.evaluate(() => {
     let sankeyPaths = document.querySelectorAll('.sankey-link, path[stroke-opacity]').length;
     let sankeyNodes = document.querySelectorAll('rect.recharts-sankey-node').length;
     return {
         sankeyPaths,
         sankeyNodes
     };
  });
  console.log("Sankey Info:", sankeyHtml);

  await browser.close();
})();
