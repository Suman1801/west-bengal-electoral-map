const fs = require('fs');
const path = require('path');
const https = require('https');

const logos = {
  "BJP": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Bharatiya_Janata_Party_logo.svg",
  "INC": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Indian_National_Congress_hand_logo.svg",
  "AITC": "https://upload.wikimedia.org/wikipedia/commons/c/c0/All_India_Trinamool_Congress_flag_and_logo.svg",
  "CPI_M": "https://upload.wikimedia.org/wikipedia/commons/9/9a/CPI-M-flag.svg",
  "CPI": "https://upload.wikimedia.org/wikipedia/commons/1/18/CPI-logo.svg",
  "AAP": "https://upload.wikimedia.org/wikipedia/commons/2/22/Aam_Aadmi_Party_logo_%28English%29.svg",
  "BSP": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Elephant_Bahujan_Samaj_Party.svg",
  "SP": "https://upload.wikimedia.org/wikipedia/commons/7/75/Samajwadi_Party_Flag.svg",
  "TDP": "https://upload.wikimedia.org/wikipedia/commons/1/10/Telugu_Desam_Party_Flag.svg",
  "YSRCP": "https://upload.wikimedia.org/wikipedia/commons/0/00/YSR_Congress_Party_logo.svg",
  "SHS": "https://upload.wikimedia.org/wikipedia/commons/3/30/Shiv_Sena_logo_and_flag.svg",
  "NCP": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Nationalist_Congress_Party_Logo.svg",
  "JDU": "https://upload.wikimedia.org/wikipedia/commons/1/17/Janata_Dal_%28United%29_Flag.svg",
  "RJD": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Rashtriya_Janata_Dal_logo.svg",
  "BJD": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Biju_Janata_Dal_logo.svg",
  "JMM": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Jharkhand_Mukti_Morcha_Flag.svg",
  "AIFB": "https://upload.wikimedia.org/wikipedia/commons/0/05/All_India_Forward_Bloc_Flag.svg",
  "RSP": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Revolutionary_Socialist_Party_%28India%29_Flag.svg",
  "DMK": "https://upload.wikimedia.org/wikipedia/commons/f/ff/DMK_Flag.svg",
  "AIADMK": "https://upload.wikimedia.org/wikipedia/commons/6/69/All_India_Anna_Dravida_Munnetra_Kazhagam_Flag.svg"
};

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const promises = Object.entries(logos).map(([party, url]) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(dir, `${party}.svg`));
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink(path.join(dir, `${party}.svg`), () => {});
      reject(err);
    });
  });
});

Promise.all(promises).then(() => {
  console.log('All logos downloaded!');
}).catch(console.error);
