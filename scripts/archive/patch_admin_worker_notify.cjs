const fs = require('fs');
const path = require('path');

// 1. Patch admin.html
const adminPath = path.join(__dirname, '..', 'admin.html');
let adminContent = fs.readFileSync(adminPath, 'utf8');

if (!adminContent.includes("fetch(`${WORKER_API}/api/notify-order-status`")) {
  adminContent = adminContent.replace(
    /(await writeAudit\('ORDER_DELIVERED_COD_COLLECTED',\s*key,\s*\{\s*total:\s*ord\.total\s*\}\);\s*showToast\(`Order #\$\{ord\.id\} delivered and cash collected\.`\);)/,
    `$1\n          fetch(\`\${WORKER_API}/api/notify-order-status\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: key, status: 'delivered' }) }).catch(() => {});`
  );

  adminContent = adminContent.replace(
    /(await writeAudit\(`ORDER_STATUS_\$\{targetStatus\.toUpperCase\(\)\}`,\s*key\);\s*showToast\(`Order #\$\{ord\.id\} updated to \$\{targetStatus\}\.`\);)/,
    `$1\n          fetch(\`\${WORKER_API}/api/notify-order-status\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: key, status: targetStatus }) }).catch(() => {});`
  );

  fs.writeFileSync(adminPath, adminContent, 'utf8');
  console.log('✅ Patched admin.html with notify-order-status calls');
}

// 2. Patch worker.html
const workerHtmlPath = path.join(__dirname, '..', 'worker.html');
let workerContent = fs.readFileSync(workerHtmlPath, 'utf8');

if (!workerContent.includes('/api/notify-order-status')) {
  workerContent = workerContent.replace(
    /(await db\.ref\('orders\/' \+ pushKey\)\.update\(updatePayload\);)/,
    `$1\n        fetch((window.APP_CONFIG?.workerApi || 'https://ra-store-api.chowdarynikhil095.workers.dev') + '/api/notify-order-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: pushKey, status: nextStatus }) }).catch(() => {});`
  );

  workerContent = workerContent.replace(
    /(await db\.ref\('orders\/' \+ pushKey\)\.update\(\{\s*status:\s*'delivered'[\s\S]*?updatedAt:\s*new Date\(\)\.toISOString\(\)\s*\}\);)/,
    `$1\n        fetch((window.APP_CONFIG?.workerApi || 'https://ra-store-api.chowdarynikhil095.workers.dev') + '/api/notify-order-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: pushKey, status: 'delivered' }) }).catch(() => {});`
  );

  fs.writeFileSync(workerHtmlPath, workerContent, 'utf8');
  console.log('✅ Patched worker.html with notify-order-status calls');
}
