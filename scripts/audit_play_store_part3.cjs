const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

console.log('=== 3. MODALS & POPSTATE AUDIT ===');
// Find all modals in index.html
const modalMatches = indexHtml.match(/<div[^>]*class=["'][^"']*modal-overlay[^"']*["'][^>]*id=["']([^"']+)["']/g);
console.log('Found modal-overlay elements:', modalMatches);

// Check openModal and closeModal definitions
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
  if (l.includes('function openModal') || l.includes('function closeModal')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

// Check all places where openModal is called
console.log('\n--- openModal calls ---');
lines.forEach((l, i) => {
  if (l.includes('openModal(')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

// Check popstate listener
console.log('\n--- popstate listeners ---');
lines.forEach((l, i) => {
  if (l.includes("addEventListener('popstate'")) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});

// Check touch CSS
console.log('\n--- Touch CSS Audit ---');
console.log('Has overscroll-behavior-y:', indexHtml.includes('overscroll-behavior'));
console.log('Has -webkit-tap-highlight-color on body/html:', indexHtml.includes('-webkit-tap-highlight-color'));

