const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

for (let i = 630; i < 715; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
