const fs = require('fs');
let code = fs.readFileSync('scripts/test_categories_screen.cjs', 'utf8');

// 1. Update toast selector
code = code.replace(
  "const toast = document.getElementById('toast');",
  "const toast = document.getElementById('toastMsg');"
);

// 2. Update card selector
code = code.replace(
  "const cards = document.querySelectorAll('.product-card').length;",
  "const cards = document.querySelectorAll('#productsGrid .card').length;"
);

fs.writeFileSync('scripts/test_categories_screen.cjs', code, 'utf8');
console.log('Updated test selectors for toast and card.');

