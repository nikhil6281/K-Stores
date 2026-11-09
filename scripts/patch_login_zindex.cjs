const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetCss = `.modal-overlay {
      z-index: 400 !important;
    }`;
const replCss = `.modal-overlay {
      z-index: 400 !important;
    }
    #loginModal {
      z-index: 600 !important;
    }`;

if (html.includes('.modal-overlay {\r\n      z-index: 400 !important;\r\n    }')) {
  html = html.replace(
    '.modal-overlay {\r\n      z-index: 400 !important;\r\n    }',
    '.modal-overlay {\r\n      z-index: 400 !important;\r\n    }\r\n    #loginModal {\r\n      z-index: 600 !important;\r\n    }'
  );
  console.log('✅ Added #loginModal z-index');
}

const targetFn = `function openLoginModal() {
      document.getElementById('emailInputStep').style.display = 'block';`;

const replFn = `function openLoginModal() {
      const ordersEl = document.getElementById('ordersModal');
      if (ordersEl && ordersEl.style.display === 'flex') {
        closeModal('ordersModal');
      }
      document.getElementById('emailInputStep').style.display = 'block';`;

if (html.includes('function openLoginModal() {\r\n      document.getElementById(\'emailInputStep\').style.display = \'block\';')) {
  html = html.replace(
    'function openLoginModal() {\r\n      document.getElementById(\'emailInputStep\').style.display = \'block\';',
    'function openLoginModal() {\r\n      const ordersEl = document.getElementById(\'ordersModal\');\r\n      if (ordersEl && ordersEl.style.display === \'flex\') {\r\n        closeModal(\'ordersModal\');\r\n      }\r\n      document.getElementById(\'emailInputStep\').style.display = \'block\';'
  );
  console.log('✅ Updated openLoginModal to close ordersModal first');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done patching index.html');

