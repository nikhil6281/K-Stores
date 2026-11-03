const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');
const isCrlf = content.includes('\r\n');
const eol = isCrlf ? '\r\n' : '\n';

const target = `        list.innerHTML = fullHtml;${eol}      });${eol}${eol}    document.getElementById('customerOrdersList')`;
const replacement = `        list.innerHTML = fullHtml;${eol}      });${eol}    }${eol}${eol}    document.getElementById('ordersNavBtn')?.addEventListener('click', openOrdersModal);${eol}${eol}    document.getElementById('customerOrdersList')`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('✅ Successfully applied closing brace and ordersNavBtn listener to index.html');
} else {
  console.error('❌ Target string not found in index.html');
}

