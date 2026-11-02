const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Add handleProductImgError helper right after SVG_PLACEHOLDER
if (!content.includes('function handleProductImgError(')) {
  const targetSvg = 'const SVG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'140\' height=\'110\' viewBox=\'0 0 140 110\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23f3f4f6\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-family=\'sans-serif\' font-size=\'12\' fill=\'%239ca3af\' text-anchor=\'middle\' dy=\'.3em\'%3ERA Store%3C/text%3E%3C/svg%3E";';
  const newSvg = targetSvg + `\n\n    function handleProductImgError(el) {\n      if (el) {\n        el.onerror = null;\n        el.src = SVG_PLACEHOLDER;\n      }\n    }`;
  content = content.replace(targetSvg, newSvg);
  console.log('✅ Added handleProductImgError helper function');
}

// 2. Replace onerror="this.onerror=null; this.src='${SVG_PLACEHOLDER}';"
content = content.replace(/onerror="this\.onerror=null;\s*this\.src='\$\{SVG_PLACEHOLDER\}';"/g, 'onerror="handleProductImgError(this);"');
console.log('✅ Replaced broken img onerror with handleProductImgError(this);');

// 3. Version bump in Account footer and constant
const oldFooter = 'RA Store v2.1.0 • Anantapur, Andhra Pradesh';
const newFooter = 'RA Store v2.1.1 • Anantapur, Andhra Pradesh';
if (content.includes(oldFooter)) {
  content = content.replace(oldFooter, newFooter);
  console.log('✅ Bumped Account footer version to v2.1.1');
}

// 4. Declare APP_VERSION
if (!content.includes('const APP_VERSION =')) {
  content = content.replace(
    /const SVG_PLACEHOLDER =/,
    'const APP_VERSION = "v2.1.1";\n    const SVG_PLACEHOLDER ='
  );
  console.log('✅ Declared APP_VERSION = "v2.1.1"');
}

// 5. Update Debug Panel with the 7 required fields:
// backend connected, signed-in state, product and category counts, last error, service-worker state, notification permission, app version
const oldDebugState = `    const debugState = {
      firebaseInit: 'OK (firebase-compat 9.23.0)',
      databaseURL: firebaseConfig.databaseURL,
      authState: 'Initializing...',
      readStarted: 'No',
      rowsReceived: 0,
      rowsAfterFilter: 0,
      cardsAppended: 0,
      firstCardHeight: '0px',
      errorCode: 'None',
      errorMessage: 'None'
    };`;

const newDebugState = `    const debugState = {
      appVersion: APP_VERSION,
      backendConnected: 'Checking...',
      authState: 'Initializing...',
      productCount: 0,
      categoryCount: 0,
      swState: ('serviceWorker' in navigator) ? 'Supported' : 'Unsupported',
      notifPerm: ('Notification' in window) ? Notification.permission : 'Unsupported',
      lastError: 'None'
    };`;

if (content.includes('firebaseInit: \'OK (firebase-compat 9.23.0)\'')) {
  content = content.replace(oldDebugState, newDebugState);
  console.log('✅ Updated debugState object with 7 required metrics');
}

const oldHudHtml = `      debugHudEl.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #374151;padding-bottom:4px;margin-bottom:6px;">
          <strong style="color:#10B981;font-size:11px;">🛠️ RA Store Debug Panel</strong>
          <button onclick="document.getElementById('debugHud').remove()" style="background:none;border:none;color:#9CA3AF;cursor:pointer;font-size:12px;">✕</button>
        </div>
        <div><strong>Firebase Init:</strong> <span style="color:#34D399;">\${escapeHtml(debugState.firebaseInit)}</span></div>
        <div style="word-break:break-all;"><strong>databaseURL:</strong> <span style="color:#60A5FA;">\${escapeHtml(debugState.databaseURL)}</span></div>
        <div><strong>Auth State:</strong> <span style="color:#FBBF24;">\${escapeHtml(debugState.authState)}</span></div>
        <div><strong>Read Started:</strong> \${escapeHtml(debugState.readStarted)}</div>
        <div><strong>Rows Received:</strong> <strong style="color:#34D399;">\${debugState.rowsReceived}</strong></div>
        <div><strong>Rows After Filter:</strong> <strong style="color:#34D399;">\${debugState.rowsAfterFilter}</strong></div>
        <div><strong>Cards Appended:</strong> \${debugState.cardsAppended}</div>
        <div><strong>First Card Height:</strong> <strong style="color:#A78BFA;">\${debugState.firstCardHeight}</strong></div>
        \${debugState.errorCode !== 'None' ? \`
          <div style="margin-top:6px;padding:4px 6px;background:rgba(220,38,38,0.2);border-left:3px solid #EF4444;color:#FCA5A5;">
            <strong>Error:</strong> [\${escapeHtml(debugState.errorCode)}] \${escapeHtml(debugState.errorMessage)}
          </div>
        \` : '<div style="color:#9CA3AF;"><strong>Errors:</strong> None</div>'}
      \`;`;

const newHudHtml = `      const isOnline = navigator.onLine ? 'Online' : 'Offline';
      debugHudEl.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #374151;padding-bottom:6px;margin-bottom:8px;">
          <strong style="color:#10B981;font-size:12px;">🛠️ RA STORE DIAGNOSTICS</strong>
          <button onclick="document.getElementById('debugHud').remove()" style="background:none;border:none;color:#9CA3AF;cursor:pointer;font-size:14px;line-height:1;">✕</button>
        </div>
        <div><strong>App Version:</strong> <span style="color:#60A5FA;">\${escapeHtml(debugState.appVersion)}</span></div>
        <div><strong>Backend:</strong> <span style="color:\${debugState.backendConnected.includes('Connected') ? '#34D399' : '#EF4444'};">\${escapeHtml(debugState.backendConnected)}</span> (\${isOnline})</div>
        <div><strong>Auth State:</strong> <span style="color:#FBBF24;">\${escapeHtml(debugState.authState)}</span></div>
        <div><strong>Catalog Counts:</strong> <span style="color:#A78BFA;">\${debugState.productCount} products • \${debugState.categoryCount} categories</span></div>
        <div><strong>Service Worker:</strong> <span style="color:#38BDF8;">\${escapeHtml(debugState.swState)}</span></div>
        <div><strong>Notifications:</strong> <span style="color:#F472B6;">\${escapeHtml(debugState.notifPerm)}</span></div>
        <div style="margin-top:6px;padding-top:6px;border-top:1px solid #374151;">
          \${debugState.lastError !== 'None' ? \`
            <div style="padding:4px 6px;background:rgba(220,38,38,0.25);border-left:3px solid #EF4444;color:#FCA5A5;word-break:break-word;">
              <strong>Last Error:</strong> \${escapeHtml(debugState.lastError)}
            </div>
          \` : '<div style="color:#9CA3AF;"><strong>Last Error:</strong> None</div>'}
        </div>
      \`;`;

if (content.includes('🛠️ RA Store Debug Panel')) {
  content = content.replace(oldHudHtml, newHudHtml);
  console.log('✅ Updated debugHudEl markup');
}

// 6. Connect listeners to debugState updates
if (!content.includes("debugLog('backendConnected'")) {
  content = content.replace(
    /db\.ref\('\.info\/connected'\)\.on\('value',\s*snap\s*=>\s*\{/,
    `db.ref('.info/connected').on('value', snap => {
      const isConn = !!snap.val();
      debugLog('backendConnected', isConn ? 'Connected' : 'Disconnected');`
  );
  console.log('✅ Wired .info/connected to debugState');
}

// 7. Update authState in debugLog
content = content.replace(
  /debugLog\('authState',\s*user\s*\?\s*\(user\.isAnonymous\s*\?\s*'Anonymous'\s*:\s*\(user\.phoneNumber\s*\|\|\s*user\.email\s*\|\|\s*user\.uid\)\)\s*:\s*'Signed out'\);/,
  `debugLog('authState', user ? (user.isAnonymous ? 'Signed In (Guest)' : 'Signed In (Customer)') : 'Signed Out');`
);

// 8. Update product/category counts in debugLog
content = content.replace(
  /categoriesListenerRef\.on\('value',\s*snap\s*=>\s*\{[\s\S]*?const val = snap\.val\(\) \|\| \{\};[\s\S]*?categoriesCatalog = val;/,
  `categoriesListenerRef.on('value', snap => {
        const val = snap.val() || {};
        categoriesCatalog = val;
        debugLog('categoryCount', Object.keys(val).length);`
);

content = content.replace(
  /productsCatalog = val;[\s\S]*?productsLoaded = true;/,
  `productsCatalog = val;
          productsLoaded = true;
          debugLog('productCount', Object.keys(val).length);`
);

// 9. Update service worker state and notification permission in debugLog
content = content.replace(
  /if \('serviceWorker' in navigator\) \{/,
  `if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        debugLog('swState', 'Active (controlling page)');
      } else {
        debugLog('swState', 'Registering...');
      }`
);

content = content.replace(
  /function updateNotificationUI\(\) \{/,
  `function updateNotificationUI() {
      if ('Notification' in window) {
        debugLog('notifPerm', Notification.permission);
      }`
);

// 10. Update last error in debugLog
content = content.replace(
  /debugLog\('errorCode',\s*err\.code\s*\|\|\s*'PERMISSION_DENIED',\s*true\);[\s\S]*?debugLog\('errorMessage',\s*err\.message\s*\|\|\s*'Catalog read failed\. Check Firebase Realtime Database rules\.',\s*true\);/,
  `debugLog('lastError', (err.code || 'ERR') + ': ' + (err.message || 'Catalog read failed'), true);`
);

content = content.replace(
  /debugLog\('errorCode',\s*'TIMEOUT_8S',\s*true\);[\s\S]*?debugLog\('errorMessage',\s*'8 seconds elapsed without live database response',\s*true\);/,
  `debugLog('lastError', 'TIMEOUT_8S: 8s elapsed without live database response', true);`
);

content = content.replace(
  /debugLog\('errorCode',\s*err\.code\s*\|\|\s*'CAT_ERR',\s*true\);[\s\S]*?debugLog\('errorMessage',\s*err\.message\s*\|\|\s*'Categories permission\/network failure',\s*true\);/,
  `debugLog('lastError', (err.code || 'CAT_ERR') + ': ' + (err.message || 'Categories fetch error'), true);`
);

// 11. Category ?cat= fallback with message if category not found or empty
const oldCatFallback = `      if (currentCategory && currentCategory !== 'all' && Object.keys(categoriesCatalog).length > 0) {
        if (!categoriesCatalog[currentCategory]) {
          console.warn('[RA Store] Unknown category:', currentCategory, 'falling back to all items');
          currentCategory = 'all';
          syncUrlParams();
        }
      }`;

const newCatFallback = `      if (currentCategory && currentCategory !== 'all' && Object.keys(categoriesCatalog).length > 0) {
        const catObj = categoriesCatalog[currentCategory];
        const count = Object.values(productsCatalog).filter(p => p.categoryId === currentCategory).length;
        if (!catObj || catObj.active === false || (productsLoaded && count === 0)) {
          console.warn('[RA Store] Category not found, inactive or empty:', currentCategory, 'falling back to all items');
          currentCategory = 'all';
          syncUrlParams();
          const t = I18N[currentLang] || I18N.en;
          showToast(t.categoryFallbackMsg || 'Category not found or empty. Showing all items.');
        }
      }`;

if (content.includes('Unknown category:\', currentCategory, \'falling back to all items')) {
  content = content.replace(oldCatFallback, newCatFallback);
  console.log('✅ Enhanced category ?cat= fallback with user toast message');
}

// 12. Add translations for categoryFallbackMsg
content = content.replace(
  /allCategory:\s*"All Items",/,
  `allCategory: "All Items",\n        categoryFallbackMsg: "Category not found or empty. Showing all items.",`
);

content = content.replace(
  /allCategory:\s*"అన్ని వస్తువులు",/,
  `allCategory: "అన్ని వస్తువులు",\n        categoryFallbackMsg: "వర్గం కనుగొనబడలేదు లేదా ఖాళీగా ఉంది. అన్ని వస్తువులను చూపుతున్నాము.",`
);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('🎉 Successfully patched index.html with all hardening features!');
