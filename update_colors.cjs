const fs = require('fs');
let colors = JSON.parse(fs.readFileSync('public/party_colors.json', 'utf-8'));

const newColors = {
  "BAC": "#1E4B82",
  "JNP": "#006400",
  "SUC": "#DE2328",
  "FB": "#DE2328",
  "PSP": "#FF4500",
  "SSP": "#FF4500",
  "LSS": "#FFD700",
  "IGL": "#008000",
  "RCI": "#DE2328",
  "RCPI(RB)": "#DE2328",
  "WPI": "#DE2328",
  "MFB": "#DE2328",
  "NCO": "#19AAED",
  "ICS": "#19AAED",
  "PML": "#006600",
  "MUL": "#006600",
  "JKP": "#228B22",
  "INC(I)": "#19AAED",
  "GL": "#008000",
  "DSP(PC)": "#DE2328",
  "BJS": "#FF9933",
  "BBC": "#1E4B82",
  "FB(S)": "#DE2328",
  "COM": "#DE2328",
  "JD": "#228B22",
  "IATC": "#20C646",
  "SBP": "#DE2328",
  "WBTC": "#20C646",
  "SWA": "#0000FF",
  "NOTA": "#222222",
  "M": "#A9A9A9"
};

for (const [k, v] of Object.entries(newColors)) {
  if (!colors[k]) {
    colors[k] = v;
  }
}

fs.writeFileSync('public/party_colors.json', JSON.stringify(colors, null, 2));
