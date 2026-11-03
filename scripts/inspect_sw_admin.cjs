const fs = require('fs');

const sw = fs.readFileSync('sw.js', 'utf8');
const lines = sw.split('\n');

lines.forEach((l, i) => {
  if (l.includes('admin') || l.includes('worker')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});

