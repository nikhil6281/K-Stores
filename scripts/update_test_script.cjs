const fs = require('fs');
let code = fs.readFileSync('scripts/test_categories_screen.cjs', 'utf8');

// Update version selector to use #accountAppVersion
code = code.replace(
  "return document.querySelector('#accountView div[style*=\"font-size: 11px\"]')?.innerText;",
  "return document.getElementById('accountAppVersion')?.innerText;"
);

fs.writeFileSync('scripts/test_categories_screen.cjs', code, 'utf8');
console.log('Updated test selector for version verification.');

