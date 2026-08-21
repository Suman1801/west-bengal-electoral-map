const fs = require('fs');
const path = require('path');
const https = require('https');

const parties = {
  "BJP": "Bharatiya_Janata_Party",
  "INC": "Indian_National_Congress",
  "AITC": "Trinamool_Congress",
  "CPI_M": "Communist_Party_of_India_(Marxist)",
  "CPI": "Communist_Party_of_India",
  "AAP": "Aam_Aadmi_Party",
  "BSP": "Bahujan_Samaj_Party",
  "SP": "Samajwadi_Party",
  "TDP": "Telugu_Desam_Party",
  "YSRCP": "YSR_Congress_Party",
  "SHS": "Shiv_Sena",
  "NCP": "Nationalist_Congress_Party",
  "JDU": "Janata_Dal_(United)",
  "RJD": "Rashtriya_Janata_Dal",
  "BJD": "Biju_Janata_Dal",
  "JMM": "Jharkhand_Mukti_Morcha",
  "AIFB": "All_India_Forward_Bloc",
  "RSP": "Revolutionary_Socialist_Party_(India)",
  "DMK": "Dravida_Munnetra_Kazhagam",
  "AIADMK": "All_India_Anna_Dravida_Munnetra_Kazhagam"
};

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

function fetchPageImage(title) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=250&format=json`;
    https.get(apiUrl, { headers: {'User-Agent': 'ElectionMapDataFetcher/1.0'} }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId === "-1" || !pages[pageId].thumbnail) {
             console.log("Not found:", title);
             resolve(null);
          } else {
             resolve(pages[pageId].thumbnail.source);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    // some URLs have ?utm_source... we should strip it if saving extension but here we just write
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: {'User-Agent': 'ElectionMapDataFetcher/1.0'} }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          https.get(response.headers.location, { headers: {'User-Agent': 'ElectionMapDataFetcher/1.0'} }, res2 => {
              res2.pipe(file);
              file.on('finish', () => file.close(resolve));
          });
      } else {
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
      }
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const [party, title] of Object.entries(parties)) {
    const url = await fetchPageImage(title);
    if (url) {
       console.log(`Downloading ${party} from ${url}`);
       const cleanUrl = url.split('?')[0];
       const destFile = path.join(dir, `${party}.png`);
       await downloadImage(url, destFile);
    }
  }
  
  // Independent / Unknown
  const indyHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  fs.writeFileSync(path.join(dir, 'IND.png'), indyHtml);
  
  console.log('Done downloading logos');
}

run();
