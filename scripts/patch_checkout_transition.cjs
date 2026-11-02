const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = "document.getElementById('cartDrawerCheckoutBtn').addEventListener('click', () => {\r\n      closeModal('cartDrawerModal');\r\n      openCheckout();\r\n    });";
const replacement = "document.getElementById('cartDrawerCheckoutBtn').addEventListener('click', () => {\r\n      const drawer = document.getElementById('cartDrawerModal');\r\n      if (drawer) drawer.style.display = 'none';\r\n      openCheckout();\r\n    });";

if (!html.includes(target)) {
  console.error('Target not found in index.html');
  process.exit(1);
}

html = html.replace(target, replacement);
fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ Successfully patched cartDrawerCheckoutBtn transition in index.html!');
