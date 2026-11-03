const fs = require('fs');

['admin.html', 'worker.html', 'sw.js', 'public/sw.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.js')) {
    try {
      new Function(content);
      console.log(`✅ ${file}: JS Syntax OK`);
    } catch (e) {
      console.log(`❌ ${file}: Syntax Error: ${e.message}`);
    }
  } else {
    const scripts = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];
    scripts.forEach((s, idx) => {
      if (s.includes('application/ld+json')) return;
      const code = s.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
      try {
        new Function(code);
        console.log(`✅ ${file} script #${idx + 1}: Syntax OK`);
      } catch (e) {
        console.log(`❌ ${file} script #${idx + 1}: Syntax Error: ${e.message}`);
      }
    });
  }
});

