const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

for (let i = 1705; i <= 1735; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
