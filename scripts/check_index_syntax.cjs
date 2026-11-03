const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  try {
    new vm.Script(code);
    console.log(`✅ index.html inline script #${count}: Syntax OK (${code.length} chars)`);
  } catch (err) {
    console.error(`❌ index.html inline script #${count} syntax error:`, err.message);
    process.exit(1);
  }
}
