const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const matches = content.match(/.*cart-drawer-sheet.*\{[^}]*\}/g);
console.log(matches);
const footerMatches = content.match(/.*cartDrawerFooter.*\{[^}]*\}/g);
console.log(footerMatches);
