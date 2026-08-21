const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/setAllData\(csvDataMap\);\n\s*\} catch/g, 'setAllData(csvDataMap);\n          }\n        } catch');
fs.writeFileSync('src/App.tsx', content, 'utf-8');
