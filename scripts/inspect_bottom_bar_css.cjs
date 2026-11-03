const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const matches = content.match(/\.bottom-bar\s*\{[^}]*\}/g);
console.log(matches);
