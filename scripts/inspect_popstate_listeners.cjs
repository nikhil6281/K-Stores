const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

console.log('=== POPSTATE LISTENER #1 (around line 4590) ===');
for (let i = 4580; i < 4615; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

console.log('\n=== POPSTATE LISTENER #2 (around line 5047) ===');
for (let i = 5040; i < 5080; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}

