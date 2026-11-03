const fs = require('fs');

const sw = fs.readFileSync('sw.js', 'utf8');
const lines = sw.split('\n');

for (let i = 75; i < 115; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

