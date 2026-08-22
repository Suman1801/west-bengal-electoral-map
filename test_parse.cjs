const fs = require('fs');
const Papa = require('papaparse');
const csvString = fs.readFileSync('public/wb-results-2026.csv', 'utf8');
const csvParsed = Papa.parse(csvString, { header: true, dynamicTyping: true, skipEmptyLines: true });
const csvData = csvParsed.data;

const firstRowFields = Object.keys(csvData[0]);
const COLUMN_ALIASES = {
ac_no: ["ac_no", "Constituency_No", "AC_No", "AC No", "Constituency_ID", "ac_id", "AC_ID", "id", "Constituency No", "AC NO"],
position: ["position", "Position", "Rank", "pos", "rank", "Winner_Position"],
year: ["year", "Year", "YEAR", "Year_No", "Election_Year", "ElectionYear"],
ac_name: ["ac_name", "Constituency_Name", "AC_Name", "AC Name", "Constituency Name", "Name", "AC NAME"],
candidate: ["candidate", "Candidate", "Candidate_Name", "Candidate Name", "Name", "Winner_Name"],
party: ["party", "Party", "PARTY", "Party_Name", "Abbreviation"],
votes: ["votes", "Votes", "Total Votes", "TOTAL VOTES", "Total_Votes", "Valid_Votes"],
electors: ["electors", "Electors", "Total Electors", "Total_Electors", "Elector_Count"],
margin_percentage: ["margin_pct", "margin_percentage", "Margin_Percentage", "Margin Pct", "Margin %"],
margin_absolute: ["Margin", "margin", "Margin_Votes", "Vote_Margin"],
vote_share_percentage: ["vote_share", "vote_share_percentage", "Vote_Share_Percentage", "Vote Share", "Vote %", "Vote_Share"],
turnout_percentage: ["turnout", "turnout_percentage", "Turnout_Percentage", "Turnout", "Turnout %", "Turnout_Pct"],
sex: ["Sex", "sex", "Gender", "gender"],
age: ["Age", "age", "AGE"],
district_name: ["District_Name", "district_name", "District"],
constituency_type: ["Constituency_Type", "constituency_type", "Type"],
education: ["MyNeta_education", "education", "Education"],
profession: ["TCPD_Prof_Main", "TCPD_Prof_Main_Desc", "profession"],
sub_region: ["Sub_Region", "sub_region"],
last_party: ["Last_Party", "last_party"],
same_party: ["Same_Party", "same_party"],
same_constituency: ["Same_Constituency", "same_constituency"],
last_constituency_name: ["Last_Constituency_Name", "last_constituency_name"]
};

let activeMap = {};
for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
  const foundField = firstRowFields.find(f => aliases.some(a => a.toLowerCase() === f.toLowerCase()));
  if (foundField) {
     activeMap[key] = foundField;
  }
}
console.log("Active Map:", activeMap);

const acGroups = new Map();
const fallbackYear = "2026";

for (const row of csvData) {
  let rowYear = activeMap.year && row[activeMap.year] ? String(row[activeMap.year]).trim() : fallbackYear;
  const rawAcNo = row[activeMap.ac_no];
  if (rawAcNo !== undefined && rawAcNo !== null && rawAcNo !== '') {
    const normAcNo = String(rawAcNo).trim().replace(/^0+/, "") || "0";
    const key = `${normAcNo}_${rowYear}`;
    if (!acGroups.has(key)) acGroups.set(key, []);
    acGroups.get(key).push(row);
  }
}
console.log("AC Groups count:", acGroups.size);

const csvDataMap = new Map();
for (const [acKey, candidates] of acGroups.entries()) {
  const [acNo, rowYear] = acKey.split("_");
  
  if (activeMap.position && candidates[0][activeMap.position] !== undefined) {
      candidates.sort((a, b) => (Number(a[activeMap.position]) || 999) - (Number(b[activeMap.position]) || 999));
  } else if (activeMap.votes && candidates[0][activeMap.votes] !== undefined) {
      candidates.sort((a, b) => (Number(b[activeMap.votes]) || 0) - (Number(a[activeMap.votes]) || 0));
  }
  const winner = candidates[0];
  csvDataMap.set(`WB_${acNo}_${rowYear}`, winner);
}
console.log("csvDataMap size:", csvDataMap.size);
console.log("WB_1_2026:", csvDataMap.get("WB_1_2026"));

