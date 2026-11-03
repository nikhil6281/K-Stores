const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('langToggle') || l.includes('toggleLanguage') || l.includes('currentLang')) {
    if (i < 2200) console.log(`${i+1}: ${l.trim().slice(0, 120)}`);
  }
});
