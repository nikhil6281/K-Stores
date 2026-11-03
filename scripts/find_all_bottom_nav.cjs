const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('mobileBottomNav') || l.includes('mobile-bottom-nav')) {
    console.log(`${i+1}: ${l.trim().slice(0, 120)}`);
  }
});
