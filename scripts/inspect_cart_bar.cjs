const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const matches = content.match(/.{0,80}cartBottomBar.{0,80}/g);
console.log(matches ? matches.slice(0, 10) : 'None');
