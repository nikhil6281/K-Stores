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

// 1. Add id="accountAppVersion" to the account footer version div
const versionTarget = `    <!-- 10. Small Footer Line with App Version -->
    <div style="text-align: center; font-size: 11px; color: var(--muted); padding: 10px 0 20px;">
      RA Store v2.1.2 • Anantapur, Andhra Pradesh
    </div>`;

const versionReplacement = `    <!-- 10. Small Footer Line with App Version -->
    <div id="accountAppVersion" style="text-align: center; font-size: 11px; color: var(--muted); padding: 10px 0 20px;">
      RA Store v2.1.2 • Anantapur, Andhra Pradesh
    </div>`;

html = replaceStrict(html, versionTarget, versionReplacement, 'accountAppVersion id');

// 2. Initialize currentCategory from URL at line 1713
const catInitTarget = `    let cart = JSON.parse(localStorage.getItem('ra_store_cart') || '{}');
    let productsCatalog = {};
    let categoriesCatalog = {};
    let currentUser = null;
    let currentCategory = 'all';`;

const catInitReplacement = `    let cart = JSON.parse(localStorage.getItem('ra_store_cart') || '{}');
    let productsCatalog = {};
    let categoriesCatalog = {};
    let currentUser = null;
    const urlParamsInit = new URLSearchParams(window.location.search);
    let currentCategory = urlParamsInit.get('cat') || 'all';`;

html = replaceStrict(html, catInitTarget, catInitReplacement, 'currentCategory initialization from URL');

// 3. In categoriesListenerRef, validate currentCategory against categoriesCatalog
const catSnapTarget = `      categoriesListenerRef.on('value', snap => {
        const val = snap.val() || {};
        categoriesCatalog = val;
        debugLog('categoryCount', Object.keys(val).length);
        try { localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(val)); } catch (e) {}
        renderCategoryChips();
        renderCategoriesScreen();
        renderProducts();
      }, err => {`;

const catSnapReplacement = `      categoriesListenerRef.on('value', snap => {
        const val = snap.val() || {};
        categoriesCatalog = val;
        debugLog('categoryCount', Object.keys(val).length);
        try { localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(val)); } catch (e) {}

        if (currentCategory && currentCategory !== 'all') {
          if (!categoriesCatalog[currentCategory]) {
            console.warn('[RA Store] Unknown category:', currentCategory, 'falling back to all items');
            currentCategory = 'all';
            syncUrlParams();
            showToast(currentLang === 'te' 
              ? 'కేటగిరీ కనుగొనబడలేదు. అన్ని వస్తువులు చూపిస్తున్నాము.' 
              : 'Category not found. Showing all items.');
          }
        }

        renderCategoryChips();
        renderCategoriesScreen();
        renderProducts();
      }, err => {`;

html = replaceStrict(html, catSnapTarget, catSnapReplacement, 'validate category in categoriesListener');

// 4. In productsListenerRef, scroll to currentCategory and highlight chip if category specified
const prodSnapTarget = `        renderCategoryChips();
        renderCategoriesScreen();
        renderProducts();
        updateCartUI();
        const drawer = document.getElementById('cartDrawerModal');`;

const prodSnapReplacement = `        renderCategoryChips();
        renderCategoriesScreen();
        renderProducts();
        updateCartUI();

        if (currentCategory && currentCategory !== 'all' && categoriesCatalog[currentCategory]) {
          highlightActiveChip(currentCategory);
          setTimeout(() => scrollToCategorySection(currentCategory, false), 250);
        }

        const drawer = document.getElementById('cartDrawerModal');`;

html = replaceStrict(html, prodSnapTarget, prodSnapReplacement, 'scroll on productsListener');

// 5. In openCategoriesScreen, close modals cleanly without history side-effects
const openScreenTarget = `    function openCategoriesScreen(fromTab) {
      if (currentNavTab === 'home') {
        homeScrollY = window.scrollY || window.pageYOffset || 0;
      }

      // Close any open overlays/modals
      ['cartDrawerModal', 'checkoutModal', 'ordersModal', 'addressModal', 'loginModal', 'successModal', 'imageZoomModal'].forEach(m => {
        const el = document.getElementById(m);
        if (el && (el.style.display === 'flex' || el.style.display === 'block')) {
          closeModal(m);
        }
      });
      document.body.classList.remove('modal-open', 'overlay-open', 'signin-open');`;

const openScreenReplacement = `    function openCategoriesScreen(fromTab) {
      if (currentNavTab === 'home') {
        homeScrollY = window.scrollY || window.pageYOffset || 0;
      }

      // Close any open overlays/modals directly without popstate collisions
      ['cartDrawerModal', 'checkoutModal', 'ordersModal', 'addressModal', 'loginModal', 'successModal', 'imageZoomModal'].forEach(m => {
        const el = document.getElementById(m);
        if (el && (el.style.display === 'flex' || el.style.display === 'block')) {
          el.style.display = 'none';
        }
      });
      document.body.classList.remove('modal-open', 'overlay-open', 'signin-open', 'checkout-open');`;

html = replaceStrict(html, openScreenTarget, openScreenReplacement, 'clean modal close in openCategoriesScreen');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Categories deeplink and modal transition fixes applied successfully!');

