const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const matches = content.match(/.*mobile-bottom-nav.*\{[^}]*\}/g);
console.log(matches);
