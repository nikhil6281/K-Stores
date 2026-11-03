const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

console.log('=== POPSTATE #1 ===');
for (let i = 4585; i <= 4600; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

console.log('=== POPSTATE #2 ===');
for (let i = 5045; i <= 5075; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
