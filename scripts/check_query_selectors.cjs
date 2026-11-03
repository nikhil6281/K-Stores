const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const regex = /document\.querySelector\(['"]([^'"]+)['"]\)\.addEventListener/g;
let match;
const missing = [];
const allDirect = [];

while ((match = regex.exec(content)) !== null) {
  const sel = match[1];
  allDirect.push(sel);
}

console.log('Total direct document.querySelector.addEventListener calls:', allDirect);

