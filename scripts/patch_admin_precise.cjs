const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');
const EOL = html.includes('\r\n') ? '\r\n' : '\n';

function replaceNorm(target, replacement) {
  const normTarget = target.replace(/\r?\n/g, EOL);
  const normRepl = replacement.replace(/\r?\n/g, EOL);
  if (!html.includes(normTarget)) {
    throw new Error('Target not found: ' + target.substring(0, 50));
  }
  html = html.replace(normTarget, normRepl);
}

// 1. Sort newest first
const sortTarget = `      const isActive = o => ['placed', 'accepted', 'packed', 'out_for_delivery'].includes(o.status);
      const sortOldestFirst = (a, b) => new Date(allOrders[a].createdAt) - new Date(allOrders[b].createdAt);
      const sortNewestFirst = (a, b) => new Date(allOrders[b].createdAt) - new Date(allOrders[a].createdAt);

      const activeCod = codKeys.filter(k => isActive(allOrders[k])).sort(sortOldestFirst);
      const completedCod = codKeys.filter(k => !isActive(allOrders[k])).sort(sortNewestFirst);
      const codActiveTotal = activeCod.reduce((sum, k) => sum + (Number(allOrders[k].total) || 0), 0);

      const activeOnline = onlinePaidKeys.filter(k => isActive(allOrders[k])).sort(sortOldestFirst);
      const completedOnline = onlinePaidKeys.filter(k => !isActive(allOrders[k])).sort(sortNewestFirst);`;

const sortReplacement = `      const isActive = o => ['placed', 'accepted', 'packed', 'out_for_delivery'].includes(o.status);
      function getOrderTimestamp(o) {
        if (!o) return 0;
        const raw = o.createdAt || o.created_at || o.timestamp || o.date;
        if (!raw) return 0;
        if (typeof raw === 'number') return raw;
        const parsed = new Date(raw).getTime();
        return isNaN(parsed) ? 0 : parsed;
      }
      const sortNewestFirst = (a, b) => getOrderTimestamp(allOrders[b]) - getOrderTimestamp(allOrders[a]);

      // All active and completed orders sorted strictly newest first (Requirement 2)
      const activeCod = codKeys.filter(k => isActive(allOrders[k])).sort(sortNewestFirst);
      const completedCod = codKeys.filter(k => !isActive(allOrders[k])).sort(sortNewestFirst);
      const codActiveTotal = activeCod.reduce((sum, k) => sum + (Number(allOrders[k].total) || 0), 0);

      const activeOnline = onlinePaidKeys.filter(k => isActive(allOrders[k])).sort(sortNewestFirst);
      const completedOnline = onlinePaidKeys.filter(k => !isActive(allOrders[k])).sort(sortNewestFirst);`;

replaceNorm(sortTarget, sortReplacement);

// 2. Add error callback to ordersLiveRef.on('value', ...)
const listenerEndTarget = `        renderOrdersList();
        renderCustomersList();
        calculateReports();
      });

      // Also load complete order history once for Reports and Customer CRM`;

const listenerEndReplacement = `        renderOrdersList();
        renderCustomersList();
        calculateReports();
      }, (err) => {
        if (adminOrdersLoadTimeout) clearTimeout(adminOrdersLoadTimeout);
        console.error('Admin live orders listener error:', err);
        const el = document.getElementById('ordersList');
        if (el) {
          el.classList.remove('loading');
          el.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--danger); font-size: 14px;"><p style="margin-bottom: 10px; font-weight: 600;">Could not load orders: ' + escapeHtml(err.message || 'Permission denied') + '</p><button class="btn btn-outline" onclick="location.reload()" style="font-size: 12px; padding: 6px 14px;">Retry</button></div>';
        }
      });

      // Also load complete order history once for Reports and Customer CRM`;

replaceNorm(listenerEndTarget, listenerEndReplacement);

fs.writeFileSync('admin.html', html, 'utf8');
console.log('admin.html precisely updated!');

