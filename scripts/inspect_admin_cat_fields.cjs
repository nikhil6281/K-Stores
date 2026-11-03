const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');
const lines = content.split('\n');

for (let i = 2695; i <= 2720; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
