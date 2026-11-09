const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
if (m) {
  try {
    const data = JSON.parse(m[1]);
    console.log('✅ index.html JSON-LD valid:', data.name, data.alternateName);
  } catch (e) {
    console.error('❌ index.html JSON-LD error:', e);
    process.exit(1);
  }
}

// Check other scripts
const scripts = html.match(/<script\b(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi);
if (scripts) {
  scripts.forEach((s, idx) => {
    const code = s.replace(/<script[^>]*>|<\/script>/gi, '');
    try {
      new Function(code);
      console.log(`✅ index.html JS script #${idx + 1} syntax OK`);
    } catch (e) {
      console.error(`❌ index.html JS script #${idx + 1} syntax error:`, e.message);
      process.exit(1);
    }
  });
}

