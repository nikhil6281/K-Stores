const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('function renderProducts')) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});
