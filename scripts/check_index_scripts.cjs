const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const attrs = match[1];
  const code = match[2];
  if (attrs.includes('application/ld+json')) {
    try {
      JSON.parse(code);
      console.log(`✅ script #${count} (JSON-LD): Valid JSON`);
    } catch (e) {
      console.error(`❌ script #${count} (JSON-LD) invalid:`, e.message);
    }
  } else if (!attrs.includes('src=')) {
    try {
      new vm.Script(code);
      console.log(`✅ script #${count} (JS): Syntax OK (${code.length} chars)`);
    } catch (err) {
      console.error(`❌ script #${count} (JS) syntax error:`, err.message);
    }
  } else {
    console.log(`ℹ️ script #${count}: External script (${attrs.trim()})`);
  }
}
