const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The states that need to be above trendData
const statesToMove = `
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; feature: any; data: any }[]
  >([]);

  // Simulated data state for the choropleth
  const [featureData, setFeatureData] = useState<Map<string, any>>(new Map());
  const [allData, setAllData] = useState<Map<string, any>>(new Map());
  const [legendCounts, setLegendCounts] = useState<
    { label: string; color: string; count: number }[]
  >([]);
  const [partyCounts, setPartyCounts] = useState<Record<string, number>>({});
  const [partyColors, setPartyColors] = useState<Record<string, string>>({});
`;

content = content.replace(statesToMove, '');
content = content.replace(
  'const trendData = React.useMemo(() => {',
  statesToMove + '\n  const trendData = React.useMemo(() => {'
);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
