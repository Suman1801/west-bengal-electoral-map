const fs = require('fs');
const path = require('path');
const https = require('https');

// Maps party code to the name of the file on Wikimedia Commons
const logoFiles = {
  "BJP": "File:Bharatiya_Janata_Party_logo.svg",
  "INC": "File:Indian_National_Congress_hand_logo.svg",
  "AITC": "File:All_India_Trinamool_Congress_flag_and_logo.svg",
  "CPI_M": "File:CPI-M-flag.svg",
  "CPI": "File:CPI-logo.svg",
  "AAP": "File:Aam_Aadmi_Party_logo_(English).svg",
  "BSP": "File:Elephant_Bahujan_Samaj_Party.svg",
  "SP": "File:Samajwadi_Party_Flag.svg",
  "TDP": "File:Telugu_Desam_Party_Flag.svg",
  "YSRCP": "File:YSR_Congress_Party_logo.svg",
  "SHS": "File:Shiv_Sena_logo_and_flag.svg",
  "NCP": "File:Nationalist_Congress_Party_Logo.svg",
  "JDU": "File:Janata_Dal_(United)_Flag.svg",
  "RJD": "File:Rashtriya_Janata_Dal_logo.svg",
  "BJD": "File:Biju_Janata_Dal_logo.svg",
  "JMM": "File:Jharkhand_Mukti_Morcha_Flag.svg",
  "AIFB": "File:All_India_Forward_Bloc_Flag.svg",
  "RSP": "File:Revolutionary_Socialist_Party_(India)_Flag.svg",
  "DMK": "File:DMK_Flag.svg",
  "AIADMK": "File:All_India_Anna_Dravida_Munnetra_Kazhagam_Flag.svg",
  "IND": "File:Independent_candidate_Icon.svg"
};

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

function fetchImageUrl(filename) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json`;
    https.get(apiUrl, { headers: {'User-Agent': 'Mozilla/5.0 (Node.js)'} }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId === "-1" || !pages[pageId].imageinfo) {
             console.log("Not found:", filename);
             resolve(null);
          } else {
             resolve(pages[pageId].imageinfo[0].url);
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
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: {'User-Agent': 'Mozilla/5.0 (Node.js)'} }, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const [party, filename] of Object.entries(logoFiles)) {
    const url = await fetchImageUrl(filename);
    if (url) {
       console.log(`Downloading ${party} from ${url}`);
       const ext = url.split('.').pop().toLowerCase();
       await downloadImage(url, path.join(dir, `${party}.${ext}`));
    }
  }
  console.log('Done downloading logos');
}

run();
