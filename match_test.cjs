const fs = require('fs');
const topojson = require('./public/west-bengal-topo.json');

const csv = fs.readFileSync('public/west-bengal.csv', 'utf8').split('\n').filter(l => l.trim().length > 0);
const header = csv[0].split(',');
const nameIdx = header.indexOf('Constituency_Name');
const yearIdx = header.indexOf('Year');

const acs2006 = new Set();
for (const line of csv) {
    const cols = line.split(',');
    if (cols[yearIdx] === '2006' && cols[nameIdx]) {
        acs2006.add(cols[nameIdx].trim().toLowerCase());
    }
}

const mapAcs = new Set();
let objKey = Object.keys(topojson.objects)[0];
topojson.objects[objKey].geometries.forEach(geom => {
    let name = geom.properties.AC_NAME || geom.properties.ac_name;
    if (name) mapAcs.add(name.trim().toLowerCase());
});

let matched = 0;
for (const mac of mapAcs) {
    if (acs2006.has(mac)) matched++;
}
console.log(`Matched: ${matched} out of ${mapAcs.size} map ACs and ${acs2006.size} 2006 ACs`);
