import fs from 'fs';
const content = fs.readFileSync('vite.config.ts', 'utf8');
const lines = content.split('\n');
const filtered = lines.filter(line => !line.includes('HMR is disabled') && !line.includes('file watching is disabled'));
fs.writeFileSync('vite.config.ts', filtered.join('\n'));
