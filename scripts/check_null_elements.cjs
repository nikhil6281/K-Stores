const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const regex = /document\.getElementById\(['"]([^'"]+)['"]\)\.addEventListener/g;
let match;
const missing = [];
const allDirect = [];

while ((match = regex.exec(content)) !== null) {
  const id = match[1];
  allDirect.push(id);
  const pattern1 = `id="${id}"`;
  const pattern2 = `id='${id}'`;
  if (!content.includes(pattern1) && !content.includes(pattern2)) {
    missing.push(id);
  }
}

console.log('Total direct addEventListener calls:', allDirect.length);
console.log('Missing IDs with direct addEventListener:', missing);

