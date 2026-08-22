const fs = require('fs');
const Papa = require('papaparse');
const csvString = fs.readFileSync('public/wb-results-2026.csv', 'utf8');
const csvParsed = Papa.parse(csvString, { header: true, dynamicTyping: true, skipEmptyLines: true });
const csvData = csvParsed.data;

const CSV_MAP = {
  ac_no: "Constituency_No",
  position: "Position",
  year: "Year",
  ac_name: "Constituency_Name",
  candidate: "Candidate",
  party: "Party",
  votes: "Votes",
  valid_votes: "Valid_Votes",
  electors: "Electors",
  margin_percentage: "Margin_Percentage",
  vote_share_percentage: "Vote_Share_Percentage",
  turnout_percentage: "Turnout_Percentage",
  sex: "Sex",
  age: "Age",
  district_name: "District_Name"
};

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

const activeMap = { ...CSV_MAP };
for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
const foundField = firstRowFields.find(f => aliases.some(a => a.toLowerCase() === f.toLowerCase()));
if (foundField) {
   activeMap[key] = foundField;
}
}
// Clear out default mappings if they aren't actually in the CSV header
for (const key of Object.keys(activeMap)) {
 if (!firstRowFields.includes(activeMap[key])) {
     delete activeMap[key];
 }
}

console.log("Active Map after deletion:", activeMap);
