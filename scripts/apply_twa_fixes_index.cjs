const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
const EOL = isCrlf ? '\r\n' : '\n';

function replaceStrict(str, target, replacement, label) {
  const normalizedTarget = target.replace(/\r?\n/g, EOL);
  const normalizedReplacement = replacement.replace(/\r?\n/g, EOL);
  if (!str.includes(normalizedTarget)) {
    throw new Error(`Target not found for: ${label}`);
  }
  return str.replace(normalizedTarget, normalizedReplacement);
}

// 1. Add #offlineBanner right after <body>
const bodyTarget = `<body>
  <div id="appWrapper">`;

const bodyReplacement = `<body>
  <!-- Non-intrusive Offline Indicator for Google Play Review & Airplane Mode -->
  <div id="offlineBanner" style="display: none; position: fixed; top: 0; left: 0; right: 0; background: #1F2937; color: #FFFFFF; font-size: 12px; font-weight: 600; text-align: center; padding: 7px 12px; z-index: 10000; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
    <span id="tOfflineBannerText">📡 You are offline. Showing cached catalog.</span>
  </div>

  <div id="appWrapper">`;

html = replaceStrict(html, bodyTarget, bodyReplacement, 'Offline Banner markup');

// 2. Add offline event listener and update online handling
const onlineTarget = `    // Re-sync catalog automatically when network returns after being offline
    window.addEventListener('online', () => {
      debugLog('readStarted', 'Reloading (network online event)...');
      showToast('Back online! Refreshing items...');
      initCatalogListeners();
    });`;

const onlineReplacement = `    // Non-intrusive Offline / Online Network Indicator & Auto Re-sync
    function updateNetworkStatus() {
      const banner = document.getElementById('offlineBanner');
      if (!navigator.onLine) {
        if (banner) {
          const tText = (currentLang === 'te')
            ? '📡 మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. కాష్ చేసిన వస్తువులు చూపిస్తున్నాము.'
            : '📡 You are offline. Showing cached catalog.';
          const textEl = document.getElementById('tOfflineBannerText');
          if (textEl) textEl.innerText = tText;
          banner.style.display = 'block';
        }
      } else {
        if (banner && banner.style.display !== 'none') {
          banner.style.display = 'none';
          showToast(currentLang === 'te' ? 'తిరిగి ఆన్‌లైన్‌కి వచ్చారు! సరుకులు రీఫ్రెష్ అవుతున్నాయి...' : 'Back online! Refreshing items...');
          initCatalogListeners();
        }
      }
    }
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    if (!navigator.onLine) updateNetworkStatus();`;

html = replaceStrict(html, onlineTarget, onlineReplacement, 'Network status handlers');

// 3. Fix Android Hardware Back Button Popstate Double-Pop bug
const popstate1Target = `    window.addEventListener('popstate', (e) => {
      const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
      if (openModals.length > 0) {
        const topModal = openModals[openModals.length - 1];
        closeModal(topModal.id, true);
      }
      syncBottomBar();
    });`;

const popstate1Replacement = `    let lastPopstateModalClosedTime = 0;

    window.addEventListener('popstate', (e) => {
      const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
      if (openModals.length > 0) {
        lastPopstateModalClosedTime = Date.now();
        const topModal = openModals[openModals.length - 1];
        closeModal(topModal.id, true);
      }
      syncBottomBar();
    });`;

html = replaceStrict(html, popstate1Target, popstate1Replacement, 'Popstate 1 modal timestamp');

const popstate2Target = `    // Override popstate to handle Android back button from Account and Categories to Home
    window.addEventListener('popstate', (e) => {
      const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
      if (openModals.length > 0) {
        // Modal was closed by standard handler
        return;
      }`;

const popstate2Replacement = `    // Override popstate to handle Android back button from Account and Categories to Home
    window.addEventListener('popstate', (e) => {
      if (Date.now() - lastPopstateModalClosedTime < 100) {
        // Modal was closed by modal handler on this popstate event: preserve current view (Account/Categories/Home)
        return;
      }
      const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
      if (openModals.length > 0) {
        // Modal was closed by standard handler
        return;
      }`;

html = replaceStrict(html, popstate2Target, popstate2Replacement, 'Popstate 2 double-pop guard');

fs.writeFileSync('index.html', html, 'utf8');
console.log('TWA enhancements (Offline banner + Popstate polish) applied to index.html successfully!');

