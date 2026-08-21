const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const standardizePartyName = (name) => {
  if (!name) return "IND";
  const n = name.toUpperCase().trim();
  if (n.includes("BJP") || n.includes("BHARATIYA JANATA")) return "BJP";
  if (n.includes("AITC") || n.includes("TRINAMOOL")) return "AITC";
  if (n.includes("INC") || (n.includes("CONGRESS") && !n.includes("TRINAMOOL") && !n.includes("NCP") && !n.includes("YSR"))) return "INC";
  if (n.includes("CPM") || n.includes("CPI(M)") || n.includes("CPI_M") || n.includes("COMMUNIST PARTY OF INDIA (MARXIST)"))
    return "CPM";
  if (n.includes("CPI") && !n.includes("MARXIST")) return "CPI";
  if (n.includes("DMK")) return "DMK";
  if (n.includes("AIADMK") || n.includes("ADMK")) return "AIADMK";
  if (n.includes("BSP") || n.includes("BAHUJAN SAMAJ")) return "BSP";
  if (n.includes("SP") || n.includes("SAMAJWADI")) return "SP";
  if (n.includes("AAP") || n.includes("AAM AADMI")) return "AAP";
  if (n.includes("TDP") || n.includes("TELUGU DESAM")) return "TDP";
  if (n.includes("YSR") || n.includes("YUVANJANA")) return "YSRCP";
  if (n.includes("SHS") || n.includes("SHIV SENA")) return "SHS";
  if (n.includes("NCP") || n.includes("NATIONALIST CONGRESS")) return "NCP";
  if (n.includes("JD(U)") || n.includes("JANATA DAL (UNITED)")) return "JDU";
  if (n.includes("RJD") || n.includes("RASHTRIYA JANATA DAL")) return "RJD";
  if (n.includes("BJD") || n.includes("BIJU JANATA DAL")) return "BJD";
  if (n.includes("JMM") || n.includes("JHARKHAND MUKTI MORCHA")) return "JMM";
  if (n.includes("IND") || n.includes("INDEPENDENT")) return "IND";
  return n.split(" ")[0]; // Try first word as code
};

const partyCodeMap = {
  "AITC": "AITC",
  "All India Trinamool Congress": "AITC",
  "BJP": "BJP",
  "Bharatiya Janata Party": "BJP",
  "INC": "INC",
  "Indian National Congress": "INC",
  "CPM": "CPI_M",
  "Communist Party of India (Marxist)": "CPI_M",
  "IND": "IND",
  "Independent": "IND",
  "CPI": "CPI",
  "Communist Party of India": "CPI",
  "AIFB": "AIFB",
  "All India Forward Bloc": "AIFB",
  "RSP": "RSP",
  "Revolutionary Socialist Party": "RSP",
  "SUCI": "SUCI",
  "Socialist Unity Centre Of India (COMMUNIST)": "SUCI",
  "BSP": "BSP",
  "Bahujan Samaj Party": "BSP",
};

const allParties = new Set();

const processCSV = (filepath, partyColName, isCode=true) => {
    const csvData = fs.readFileSync(filepath, 'utf8');
    const parsed = Papa.parse(csvData, { header: true });
    parsed.data.forEach(row => {
        const p = row[partyColName];
        if (p) {
            let pcode = p;
            if (partyCodeMap[p]) {
                pcode = partyCodeMap[p];
            } else if (!isCode) {
                pcode = standardizePartyName(p);
            }
            allParties.add(pcode);
        }
    });
};

processCSV('public/West_Bengal_AE.csv', 'Party', true);
processCSV('public/wb-results-2026.csv', 'Party', false);

const existingLogos = fs.readdirSync('public/logos').map(f => path.basename(f, '.png'));
const missingLogos = [];

for (const p of allParties) {
    if (!existingLogos.includes(p) && p !== 'IND') {
        missingLogos.push(p);
    }
}

console.log(missingLogos.sort().join(', '));
