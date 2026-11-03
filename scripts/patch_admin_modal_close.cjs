const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const target = "document.getElementById('openAddProductModalBtn').addEventListener('click', () => {";
const replacement = `// Modal Close Buttons & Overlay Dismissal
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        if (modalId) {
          const el = document.getElementById(modalId);
          if (el) el.style.display = 'none';
        }
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
        }
      });
    });

    document.getElementById('openAddProductModalBtn').addEventListener('click', () => {`;

if (!html.includes(target)) {
  console.error('Target not found in admin.html');
  process.exit(1);
}

html = html.replace(target, replacement);
fs.writeFileSync('admin.html', html, 'utf8');
console.log('✅ Successfully added modal close handlers to admin.html!');

