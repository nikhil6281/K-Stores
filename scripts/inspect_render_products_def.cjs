const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

function printRange(start, end) {
  console.log(`=== LINES ${start} - ${end} ===`);
  for (let i = start - 1; i < end && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

printRange(2300, 2400);
