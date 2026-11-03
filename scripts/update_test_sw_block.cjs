const fs = require('fs');
let code = fs.readFileSync('scripts/test_categories_screen.cjs', 'utf8');

if (!code.includes("serviceWorkers: 'block'")) {
  code = code.replace(
    "viewport: { width: 360, height: 740 } // 360px mobile viewport",
    "viewport: { width: 360, height: 740 }, // 360px mobile viewport\n    serviceWorkers: 'block'"
  );
  fs.writeFileSync('scripts/test_categories_screen.cjs', code, 'utf8');
  console.log('Added serviceWorkers: block to test_categories_screen.cjs');
}

