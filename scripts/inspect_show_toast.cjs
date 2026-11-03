const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

for (let i = 4620; i <= 4640; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

