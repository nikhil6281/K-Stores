const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes("Loading orders") || l.includes("ordersModal") || l.includes("openOrdersModal") || l.includes("renderOrders") || (l.includes("orders") && l.includes("ref("))) {
    console.log((i+1) + ': ' + l.trim().substring(0, 120));
  }
});

