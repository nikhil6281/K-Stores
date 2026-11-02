const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const scripts = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
const script7 = scripts[6].replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');

fs.writeFileSync('scripts/temp_script.js', script7, 'utf8');
console.log('Saved scripts/temp_script.js');
