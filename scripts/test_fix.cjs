const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');
const target = `        list.innerHTML = fullHtml;
      });

    document.getElementById('customerOrdersList')`;

const replacement = `        list.innerHTML = fullHtml;
      });
    }

    document.getElementById('ordersNavBtn')?.addEventListener('click', openOrdersModal);

    document.getElementById('customerOrdersList')`;

// Normalize CRLF to LF for matching
content = content.replace(/\r\n/g, '\n');
if (content.includes(target)) {
  content = content.replace(target, replacement);
  const scripts = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi);
  const s7 = scripts[6].replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '');
  try {
    new Function(s7);
    console.log('🎉 PERFECT! Script #7 parses cleanly with ZERO syntax errors!');
  } catch (e) {
    console.log('Error still:', e.message);
  }
} else {
  console.log('Target not found');
}
