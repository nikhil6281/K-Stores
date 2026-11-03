const fs = require('fs');

console.log('=== 2. SERVICE WORKER & OFFLINE AUDIT ===');
['sw.js', 'public/sw.js'].forEach(swFile => {
  if (fs.existsSync(swFile)) {
    const content = fs.readFileSync(swFile, 'utf8');
    console.log(`\n--- ${swFile} ---`);
    const shellAssetsMatch = content.match(/const SHELL_ASSETS = \[([\s\S]*?)\];/);
    if (shellAssetsMatch) {
      console.log('SHELL_ASSETS:', shellAssetsMatch[1].trim());
    }
    console.log('Caches admin.html:', content.includes('admin.html'));
    console.log('Caches worker:', content.includes('worker'));
    console.log('Has fetch handler:', content.includes("self.addEventListener('fetch'"));
    console.log('Offline fallback page:', content.includes('offlineFallback') || content.includes('offline.html'));
  }
});

// Check offline indicators in index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
console.log('\n--- index.html Offline Indicators ---');
console.log('Has offline banner in HTML:', indexHtml.includes('id="offlineBanner"') || indexHtml.includes('offline-banner'));
console.log('Has window "online" listener:', indexHtml.includes("addEventListener('online'"));
console.log('Has window "offline" listener:', indexHtml.includes("addEventListener('offline'"));

