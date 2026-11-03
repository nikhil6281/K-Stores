const fs = require('fs');

['sw.js', 'public/sw.js'].forEach(file => {
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    console.log(`=== ${file} ===`);
    lines.slice(0, 40).forEach((l, idx) => {
      if (l.includes('CACHE') || l.includes('v11') || l.includes('version')) {
        console.log(`${idx+1}: ${l}`);
      }
    });
  }
});
