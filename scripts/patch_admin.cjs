const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// 1. Title and Favicon
html = html.replace(/<title>RA Store — Owner Portal<\/title>/g, '<title>Sri Sai — Owner Portal</title>');
html = html.replace(/<title>[^<]*Owner Portal[^<]*<\/title>/g, '<title>Sri Sai — Owner Portal</title>');
html = html.replace(
  /<link rel="icon" href="[^"]+">/g,
  '<link rel="icon" type="image/png" sizes="48x48" href="./assets/logo/favicon-48.png?v=2">'
);

// 2. Header: logo + title
html = html.replace(
  /<h1 style="margin-bottom: 0;">RA Store <span>OWNER PORTAL<\/span><\/h1>/g,
  `<div style="display: flex; align-items: center; gap: 10px;">
        <img src="./assets/logo/sri-sai-logo.png?v=2" alt="Sri Sai" style="height: 38px; width: auto; object-fit: contain;">
        <h1 style="margin-bottom: 0;">Sri Sai <span>OWNER PORTAL</span></h1>
      </div>`
);

// 3. Login Box: add Sri Sai logo
html = html.replace(
  /<div id="loginView" class="auth-box">/g,
  `<div id="loginView" class="auth-box">
      <img src="./assets/logo/sri-sai-logo.png?v=2" alt="Sri Sai" style="height: 52px; margin: 0 auto 14px; display: block; object-fit: contain;">`
);

// 4. Update Staff Modal hints (Requirement 6)
html = html.replace(
  /Google Account UID <span style="font-weight: normal; color: var\(--muted\);">\(Optional - auto-links on staff sign-in via email\/phone\)<\/span>/g,
  'Staff Account UID <span style="font-weight: normal; color: var(--muted);">(Optional - auto-links on staff sign-in via email)</span>'
);
html = html.replace(
  /Leave blank: staff will automatically link when they sign in with their email or phone\./g,
  'Leave blank: staff will automatically link when they sign in with their email (Google or Email OTP).'
);

// 5. Order sorting newest first (Requirement 2)
const sortOldTarget = `      const isActive = o => ['placed', 'accepted', 'packed', 'out_for_delivery'].includes(o.status);
      const sortOldestFirst = (a, b) => new Date(allOrders[a].createdAt) - new Date(allOrders[b].createdAt);
      const sortNewestFirst = (a, b) => new Date(allOrders[b].createdAt) - new Date(allOrders[a].createdAt);

      const activeCod = codKeys.filter(k => isActive(allOrders[k])).sort(sortOldestFirst);
      const completedCod = codKeys.filter(k => !isActive(allOrders[k])).sort(sortNewestFirst);
      const codActiveTotal = activeCod.reduce((sum, k) => sum + (Number(allOrders[k].total) || 0), 0);

      const activeOnline = onlinePaidKeys.filter(k => isActive(allOrders[k])).sort(sortOldestFirst);
      const completedOnline = onlinePaidKeys.filter(k => !isActive(allOrders[k])).sort(sortNewestFirst);`;

const sortNewRepl = `      const isActive = o => ['placed', 'accepted', 'packed', 'out_for_delivery'].includes(o.status);
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

if (html.includes(sortOldTarget)) {
  html = html.replace(sortOldTarget, sortNewRepl);
  console.log('Replaced order sorting in admin.html');
} else {
  console.warn('Warning: sortOldTarget not found in admin.html');
}

// 6. Orders Listener error handling & 10s timeout (Requirement 1)
const listenerOld = `    function initRealtimeListeners() {
      // Live recent orders query (limitToLast 200 for performance)
      const ordersLiveRef = db.ref('orders').limitToLast(200);

      ordersLiveRef.on('value', snap => {
        document.getElementById('ordersList').classList.remove('loading');
        const val = snap.val() || {};`;

const listenerNew = `    let adminOrdersLoadTimeout = null;

    function initRealtimeListeners() {
      const ordersListEl = document.getElementById('ordersList');
      if (adminOrdersLoadTimeout) clearTimeout(adminOrdersLoadTimeout);
      adminOrdersLoadTimeout = setTimeout(() => {
        if (ordersListEl && ordersListEl.innerText.includes('Loading orders...')) {
          ordersListEl.classList.remove('loading');
          ordersListEl.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--danger); font-size: 14px;"><p style="margin-bottom: 10px; font-weight: 600;">Could not load live orders. Please check your connection.</p><button class="btn btn-outline" onclick="location.reload()" style="font-size: 12px; padding: 6px 14px;">Retry</button></div>';
        }
      }, 10000);

      // Live recent orders query (limitToLast 200 for performance)
      const ordersLiveRef = db.ref('orders').limitToLast(200);

      ordersLiveRef.on('value', snap => {
        if (adminOrdersLoadTimeout) clearTimeout(adminOrdersLoadTimeout);
        document.getElementById('ordersList').classList.remove('loading');
        const val = snap.val() || {};`;

html = html.replace(listenerOld, listenerNew);

// Add error callback to ordersLiveRef.on('value', ...)
const listenerEndTarget = `      });
    }

    function initStaffListeners() {`;

const listenerEndRepl = `      }, (err) => {
        if (adminOrdersLoadTimeout) clearTimeout(adminOrdersLoadTimeout);
        console.error('Admin live orders listener error:', err);
        const el = document.getElementById('ordersList');
        if (el) {
          el.classList.remove('loading');
          el.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--danger); font-size: 14px;"><p style="margin-bottom: 10px; font-weight: 600;">Could not load orders: ' + escapeHtml(err.message || 'Permission denied') + '</p><button class="btn btn-outline" onclick="location.reload()" style="font-size: 12px; padding: 6px 14px;">Retry</button></div>';
        }
      });
    }

    function initStaffListeners() {`;

if (html.includes(listenerEndTarget)) {
  html = html.replace(listenerEndTarget, listenerEndRepl);
  console.log('Added error callback to admin ordersLiveRef');
} else {
  console.warn('Warning: listenerEndTarget not found in admin.html');
}

// 7. Brand replacements throughout admin.html
html = html.replace(/RA Store/g, 'Sri Sai');
html = html.replace(/RA Stores/g, 'Sri Sai');
html = html.replace(/RA_Store/g, 'Sri_Sai');

fs.writeFileSync('admin.html', html, 'utf8');
console.log('admin.html successfully patched!');
