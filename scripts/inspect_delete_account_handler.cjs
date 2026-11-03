const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const lines = indexHtml.split('\n');

lines.forEach((l, i) => {
  if (l.includes('btnDeleteAccount')) {
    console.log(`Found btnDeleteAccount at line ${i+1}`);
    for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 45); j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
  }
});

