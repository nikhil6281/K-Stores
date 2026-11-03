const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

for (let i = 4585; i <= 4600; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

for (let i = 5045; i <= 5065; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
