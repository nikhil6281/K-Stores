const fs = require('fs');

console.log('=== manifest.json ===');
console.log(fs.readFileSync('manifest.json', 'utf8'));

console.log('\n=== public/manifest.json ===');
console.log(fs.readFileSync('public/manifest.json', 'utf8'));

