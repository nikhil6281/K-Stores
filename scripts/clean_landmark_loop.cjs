const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const targetOld = `    // Quick landmark chips click delegated
    // document.querySelectorAll('.landmark-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-val');
        const addr = document.getElementById('custAddress');
        if (!addr.value.trim()) {
          addr.value = val;
        } else if (!addr.value.includes(val)) {
          addr.value = addr.value.trim() + ', ' + val;
        }
      });
    });`;

content = content.replace(/\r\n/g, '\n');
if (content.includes(targetOld)) {
  content = content.replace(targetOld, '');
  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✅ Cleaned up old uncommented landmark loop');
} else {
  console.log('Target not found');
}
