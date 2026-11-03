const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('categories') || l.includes('nameTe') || l.includes('catModal') || l.includes('categoryModal')) {
    if (l.length < 150) console.log(`${i+1}: ${l.trim()}`);
  }
});
