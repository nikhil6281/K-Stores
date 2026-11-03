const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const targetBlock = `    const isDebugMode = (new URLSearchParams(window.location.search)).get('debug') === '1';
    let debugHudEl = null;
    const debugState = {
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
    };

    function updateDebugHud() {
      if (!isDebugMode) return;
      if (!debugHudEl) {
        debugHudEl = document.createElement('div');
        debugHudEl.id = 'debugHud';
        debugHudEl.style.cssText = 'position:fixed;top:64px;right:8px;z-index:99999;background:rgba(17,24,39,0.95);color:#E5E7EB;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:10px;line-height:1.4;padding:10px 12px;border-radius:8px;border:1px solid #374151;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);max-width:320px;max-height:55vh;overflow-y:auto;pointer-events:auto;';
        document.body.appendChild(debugHudEl);
      }
      debugHudEl.innerHTML = \`
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
      \`;
    }`;

const newBlock = `    const isDebugMode = (new URLSearchParams(window.location.search)).get('debug') === '1';
    let debugHudEl = null;
    const debugState = {
      appVersion: APP_VERSION,
      backendConnected: 'Checking...',
      authState: 'Initializing...',
      productCount: 0,
      categoryCount: 0,
      swState: ('serviceWorker' in navigator) ? 'Supported' : 'Unsupported',
      notifPerm: ('Notification' in window) ? Notification.permission : 'Unsupported',
      lastError: 'None'
    };

    function updateDebugHud() {
      if (!isDebugMode) return;
      if (!debugHudEl) {
        debugHudEl = document.createElement('div');
        debugHudEl.id = 'debugHud';
        debugHudEl.style.cssText = 'position:fixed;top:64px;right:8px;z-index:99999;background:rgba(17,24,39,0.96);color:#E5E7EB;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;line-height:1.45;padding:12px 14px;border-radius:10px;border:1px solid #374151;box-shadow:0 12px 28px rgba(0,0,0,0.5);max-width:320px;max-height:60vh;overflow-y:auto;pointer-events:auto;';
        document.body.appendChild(debugHudEl);
      }
      const isOnline = navigator.onLine ? 'Online' : 'Offline';
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
      \`;
    }`;

// Normalize line endings
const normContent = content.replace(/\r\n/g, '\n');
const normTarget = targetBlock.replace(/\r\n/g, '\n');
const normNew = newBlock.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  const isCrlf = content.includes('\r\n');
  const finalNew = isCrlf ? normNew.replace(/\n/g, '\r\n') : normNew;
  const finalTarget = isCrlf ? normTarget.replace(/\n/g, '\r\n') : normTarget;
  content = content.replace(finalTarget, finalNew);
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✅ Successfully replaced debugHud with exact 7 metrics');
} else {
  console.error('❌ Could not find normTarget');
}

