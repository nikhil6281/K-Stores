const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const lines = indexHtml.split('\n');

console.log('=== 5. PORTAL ISOLATION AUDIT IN index.html ===');
let found = false;
lines.forEach((l, i) => {
  if (l.includes('admin.html') || l.includes('worker.html') || l.includes('/worker') || l.includes('/admin')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
    found = true;
  }
});

if (!found) {
  console.log('✅ ZERO links to admin or worker portals found in index.html');
}

