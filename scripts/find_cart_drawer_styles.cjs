const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('cart-drawer') && i < 1000) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});
