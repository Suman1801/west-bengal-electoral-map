const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const additionalNames = `  "JNP": "Janata Party",
  "BAC": "Bangla Congress",
  "SUC": "Socialist Unity Centre of India",
  "FB": "Forward Bloc",
  "FBL": "Forward Bloc",
  "PSP": "Praja Socialist Party",
  "SSP": "Samyukta Socialist Party",
  "LSS": "Lok Sewak Sangh",
  "IGL": "Akhil Bharatiya Gorkha League",
  "RCI": "Revolutionary Communist Party of India",
  "RCPI(RB)": "Revolutionary Communist Party of India",
  "WPI": "Workers Party of India",
  "MFB": "Marxist Forward Bloc",
  "NCO": "Indian National Congress (O)",
  "ICS": "Indian Congress (Socialist)",
  "PML": "Muslim League",
  "MUL": "Muslim League",
  "JKP": "Jharkhand Party",
  "INC(I)": "Indian National Congress (I)",
  "GL": "Gorkha League",
  "DSP(PC)": "Democratic Socialist Party",
  "BJS": "Bharatiya Jana Sangh",
  "BBC": "Biplobi Bangla Congress",
  "FB(S)": "Forward Bloc (Socialist)",
  "COM": "Communist Party",
  "JD": "Janata Dal",
  "WBSP": "West Bengal Socialist Party",
  "GNLF": "Gorkha National Liberation Front",
  "NOTA": "None of the Above",`;

content = content.replace('"IND": "Independent"', '"IND": "Independent",\n' + additionalNames);
fs.writeFileSync('src/App.tsx', content);
