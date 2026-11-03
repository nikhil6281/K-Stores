const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

for (let i = 540; i <= 575; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
