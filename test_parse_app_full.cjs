const Papa = require('papaparse');
const fs = require('fs');

async function run() {
  const STATES = [{ id: "west-bengal", stateCode: "WB" }];
  const activeState = STATES[0];
  
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

  let csvDataMap = new Map();
  let allDiscoveredYears = new Set();
  
  const files = [
    { name: "west-bengal.csv", content: fs.readFileSync("public/west-bengal.csv", "utf8") },
    { name: "wb-results-2026.csv", content: fs.readFileSync("public/wb-results-2026.csv", "utf8") },
    { name: "West_Bengal_AE.csv", content: fs.readFileSync("public/West_Bengal_AE.csv", "utf8") }
  ];

  for (const file of files) {
    const csvParsed = Papa.parse(file.content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    const csvData = csvParsed.data;
    if (!csvData || csvData.length === 0) continue;
    
    const firstRowFields = Object.keys(csvData[0]);
    const activeMap = { ...CSV_MAP };
    for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
      const foundField = firstRowFields.find(f => aliases.some(a => a.toLowerCase() === f.toLowerCase()));
      if (foundField) {
         activeMap[key] = foundField;
      }
    }
    for (const key of Object.keys(activeMap)) {
       if (!firstRowFields.includes(activeMap[key])) {
           delete activeMap[key];
       }
    }
    
    const yearField = activeMap.year;
    let currentCsvYears = [];
    const pollNoField = firstRowFields.find(f => f.toLowerCase() === "poll_no");

    const yearMatch = file.name.match(/(?:20|19)\d{2}/);
    const fallbackYear = yearMatch ? yearMatch[0] : "2026";

    if (yearField) {
       const filteredForYears = pollNoField 
         ? csvData.filter(row => String(row[pollNoField]) === "0") 
         : csvData;
       currentCsvYears = [...new Set(filteredForYears.map(row => String(row[yearField])).filter(y => y && y !== "undefined"))];
       currentCsvYears.forEach(y => allDiscoveredYears.add(y));
    } else {
       allDiscoveredYears.add(fallbackYear);
    }

    const acGroups = new Map();
    
    for (const row of csvData) {
      if (pollNoField && String(row[pollNoField]) !== "0") continue;
      
      let rowYear = activeMap.year && row[activeMap.year] ? String(row[activeMap.year]).trim() : fallbackYear;
      const rawAcNo = row[activeMap.ac_no];
      if (rawAcNo !== undefined && rawAcNo !== null && rawAcNo !== '') {
        const normAcNo = String(rawAcNo).trim().replace(/^0+/, "") || "0";
        const key = `${normAcNo}_${rowYear}`;
        if (!acGroups.has(key)) acGroups.set(key, []);
        acGroups.get(key).push(row);
      }
    }

    const partyCodeMap = { "BJP": "BJP", "AITC": "AITC", "INC": "INC", "CPM": "CPI_M", "CPI_M": "CPI_M" };

    for (const [acKey, candidates] of acGroups.entries()) {
      const [acNo, rowYear] = acKey.split("_");
      
      if (activeMap.position && candidates[0][activeMap.position] !== undefined) {
          candidates.sort((a, b) => (Number(a[activeMap.position]) || 999) - (Number(b[activeMap.position]) || 999));
      } else if (activeMap.votes && candidates[0][activeMap.votes] !== undefined) {
          candidates.sort((a, b) => (Number(b[activeMap.votes]) || 0) - (Number(a[activeMap.votes]) || 0));
      }
      
      const winner = candidates[0];
      const runnerUp = candidates.length > 1 ? candidates[1] : null;
      
      const votes = Number(winner[activeMap.votes]) || 0;
      const runnerVotes = runnerUp ? (Number(runnerUp[activeMap.votes]) || 0) : 0;
      const rawParty = winner[activeMap.party] || "IND";
      
      const totalVotesPolled = candidates.reduce((sum, c) => sum + (Number(c[activeMap.votes]) || 0), 0);
      const margin = votes - runnerVotes;
      const calculatedMarginPct = totalVotesPolled > 0 ? (margin / totalVotesPolled) * 100 : 0;
      const calculatedVoteShare = totalVotesPolled > 0 ? (votes / totalVotesPolled) * 100 : 0;

      let margin_pct = calculatedMarginPct;
      let vote_share = calculatedVoteShare;
      
      const record = {
        year: String(rowYear),
        ac_no: acNo,
        candidate: winner[activeMap.candidate],
        party: rawParty,
        votes: votes,
        total_votes: totalVotesPolled,
        margin_pct: margin_pct,
        vote_share: vote_share
      };
      
      csvDataMap.set(`${activeState.stateCode}_${acNo}_${rowYear}`, record);
    }
  }

  console.log("csvDataMap size:", csvDataMap.size);
  console.log("WB_1_2026:", csvDataMap.get("WB_1_2026"));
  console.log("Years discovered:", Array.from(allDiscoveredYears));
}

run().catch(console.error);
