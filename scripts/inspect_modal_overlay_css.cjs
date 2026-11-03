const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const matches = content.match(/.*modal-overlay.*\{[^}]*\}/g);
console.log(matches);
