const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
const EOL = isCrlf ? '\r\n' : '\n';

function replaceStrict(str, target, replacement, label) {
  // Normalize both target and replacement to match file EOL
  const normalizedTarget = target.replace(/\r?\n/g, EOL);
  const normalizedReplacement = replacement.replace(/\r?\n/g, EOL);
  if (!str.includes(normalizedTarget)) {
    throw new Error(`Target not found for: ${label}`);
  }
  return str.replace(normalizedTarget, normalizedReplacement);
}

// 1. Version bumps
html = replaceStrict(
  html,
  'RA Store v2.1.1 • Anantapur, Andhra Pradesh',
  'RA Store v2.1.2 • Anantapur, Andhra Pradesh',
  'Account footer version'
);

html = replaceStrict(
  html,
  'const APP_VERSION = "v2.1.1";',
  'const APP_VERSION = "v2.1.2";',
  'APP_VERSION constant'
);

// 2. Add Categories CSS before the closing </style> tag of the main style block
const categoriesCss = `
    /* Categories Screen Grid (Blinkit / Zepto Native Style) */
    .categories-screen-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (min-width: 640px) {
      .categories-screen-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 14px;
      }
    }

    .category-tile {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: 110px;
      cursor: pointer;
      position: relative;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .category-tile:active {
      transform: scale(0.97);
      background: #F8F9FA;
    }
    .category-tile.empty-cat {
      opacity: 0.65;
      background: #F9FAFB;
    }
    .category-tile-icon {
      font-size: 32px;
      line-height: 1;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
    }
    .category-tile-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      line-height: 1.3;
      max-height: 2.6em;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }
    .category-tile-count {
      font-size: 11px;
      color: var(--muted);
      margin-top: 4px;
      font-weight: 500;
    }
    .category-tile-badge-na {
      font-size: 10px;
      color: #991B1B;
      background: #FEE2E2;
      padding: 2px 6px;
      border-radius: 6px;
      margin-top: 4px;
      font-weight: 600;
      display: inline-block;
    }
    .category-tile-skeleton {
      min-height: 110px;
      background: #F3F4F6;
      border-radius: 12px;
      border: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }
    .category-tile-skeleton::after {
      content: "";
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.4) 20%,
        rgba(255, 255, 255, 0.7) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 1.5s infinite;
    }
`;

const cssTarget = `      .floating-contact-wrap {
        bottom: calc(120px + env(safe-area-inset-bottom, 0px)) !important;
      }
    }

  </style>`;

const cssReplacement = `      .floating-contact-wrap {
        bottom: calc(120px + env(safe-area-inset-bottom, 0px)) !important;
      }
    }
${categoriesCss}
  </style>`;

html = replaceStrict(html, cssTarget, cssReplacement, 'Categories CSS');

// 3. Add #categoriesView HTML between #homeView and #accountView
const categoriesViewHtml = `
  <!-- ============================================== -->
  <!-- PART C2: CATEGORIES SCREEN VIEW (Full Height)  -->
  <!-- ============================================== -->
  <div id="categoriesView" style="display: none; padding: 14px 16px 140px; min-height: calc(100vh - 56px); background: #F8FAFC;">
    <div class="categories-header" style="margin-bottom: 14px;">
      <h2 id="categoriesViewTitle" style="font-size: 18px; font-weight: 800; margin: 0; color: var(--text);">All Categories</h2>
      <p id="categoriesViewSub" style="font-size: 12px; color: var(--muted); margin: 3px 0 0;">Browse fresh groceries by category</p>
    </div>
    <div id="categoriesGrid" class="categories-screen-grid" role="region" aria-label="Categories Directory"></div>
  </div>
`;

const viewTarget = `</div>

  <!-- ============================================== -->
  <!-- PART D: ACCOUNT IN-PAGE VIEW (Full Height)     -->`;

const viewReplacement = `</div>
${categoriesViewHtml}
  <!-- ============================================== -->
  <!-- PART D: ACCOUNT IN-PAGE VIEW (Full Height)     -->`;

html = replaceStrict(html, viewTarget, viewReplacement, 'Categories View HTML');

// 4. Update applyLanguage to also call renderCategoriesScreen()
const langTarget = `      checkStoreHours();
      renderCategoryChips();
      renderLandmarkChips();`;

const langReplacement = `      checkStoreHours();
      renderCategoryChips();
      renderCategoriesScreen();
      renderLandmarkChips();`;

html = replaceStrict(html, langTarget, langReplacement, 'applyLanguage call');

// 5. In initCatalogListeners, also call renderCategoriesScreen() when data updates
const snapTarget = `        renderCategoryChips();
        renderProducts();
      }, err => {`;

const snapReplacement = `        renderCategoryChips();
        renderCategoriesScreen();
        renderProducts();
      }, err => {`;

html = replaceStrict(html, snapTarget, snapReplacement, 'Categories snap listener');

const prodSnapTarget = `        renderCategoryChips();
        renderProducts();
        updateCartUI();`;

const prodSnapReplacement = `        renderCategoryChips();
        renderCategoriesScreen();
        renderProducts();
        updateCartUI();`;

html = replaceStrict(html, prodSnapTarget, prodSnapReplacement, 'Products snap listener');

// 6. Unknown category fallback with toast notification
const unknownCatTarget = `      // Unknown category fallback: if requested cat doesn't exist, gracefully fall back to 'all'
      if (currentCategory && currentCategory !== 'all' && Object.keys(categoriesCatalog).length > 0) {
        if (!categoriesCatalog[currentCategory]) {
          console.warn('[RA Store] Unknown category:', currentCategory, 'falling back to all items');
          currentCategory = 'all';
          syncUrlParams();
        }
      }`;

const unknownCatReplacement = `      // Unknown category fallback: if requested cat doesn't exist, gracefully fall back to 'all'
      if (currentCategory && currentCategory !== 'all' && Object.keys(categoriesCatalog).length > 0) {
        if (!categoriesCatalog[currentCategory]) {
          console.warn('[RA Store] Unknown category:', currentCategory, 'falling back to all items');
          currentCategory = 'all';
          syncUrlParams();
          showToast(currentLang === 'te' 
            ? 'కేటగిరీ కనుగొనబడలేదు. అన్ని వస్తువులు చూపిస్తున్నాము.' 
            : 'Category not found. Showing all items.');
        }
      }`;

html = replaceStrict(html, unknownCatTarget, unknownCatReplacement, 'Unknown category fallback');

// 7. Replace old Categories tab handler and add new Categories Screen Controller & Popstate logic
const oldNavTarget = `    // Categories Tab (Step 1.3)
    document.getElementById('bnavCategoriesBtn')?.addEventListener('click', () => {
      // Close all modals/overlays
      ['cartDrawerModal', 'checkoutModal', 'ordersModal', 'addressModal', 'loginModal', 'successModal', 'imageZoomModal'].forEach(m => {
        const el = document.getElementById(m);
        if (el && (el.style.display === 'flex' || el.style.display === 'block')) {
          el.style.display = 'none';
        }
      });
      document.body.classList.remove('modal-open', 'overlay-open', 'signin-open');

      // Switch to Home view if on Account view
      const accountView = document.getElementById('accountView');
      const homeView = document.getElementById('homeView');
      if (accountView) accountView.style.display = 'none';
      if (homeView) homeView.style.display = 'block';

      // Highlight Categories tab
      setActiveNavTab('categories');

      // Smoothly scroll to the section where categories and items are shown
      const target = document.getElementById('categoryChipsBar') || document.querySelector('.sticky-controls') || document.getElementById('productsGrid');
      const nav = document.querySelector('.navbar');
      const sticky = document.querySelector('.sticky-controls');
      const navHeight = nav ? nav.offsetHeight : 57;
      const stickyHeight = sticky ? sticky.offsetHeight : 80;
      const headerOffset = navHeight + (sticky && sticky !== target ? stickyHeight : 0);

      if (target) {
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 8;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }

      syncBottomBar();
    });`;

const newNavReplacement = `    // ========================================================
    // CATEGORIES SCREEN CONTROLLER & NATIVE VIEW NAVIGATION
    // ========================================================
    const DEFAULT_CAT_ICONS = {
      'Soap': '🧼',
      'Edible Oils': '🪔',
      'Milk products': '🥛',
      'Flours & Atta': '🌾',
      'Rice & Grains': '🍚',
      'Dals & Pulses': '🥣',
      'Salt & Sugar': '🧂',
      'Spices & Masalas': '🌶️',
      'Tea & Coffee': '☕',
      'Snacks & Biscuits': '🍪',
      'Cleaning & Household': '🧹',
      'Personal Care': '🧴',
      'General': '🛒'
    };

    const DEFAULT_CAT_NAMES_TE = {
      'Soap': 'సబ్బులు',
      'Edible Oils': 'వంట నూనెలు',
      'Milk products': 'పాల ఉత్పత్తులు',
      'Flours & Atta': 'పిండి వంటకాలు',
      'Rice & Grains': 'బియ్యం & ధాన్యాలు',
      'Dals & Pulses': 'పప్పు దినుసులు',
      'Salt & Sugar': 'ఉప్పు & చక్కెర',
      'Spices & Masalas': 'మసాలా దినుసులు',
      'Tea & Coffee': 'టీ & కాఫీ',
      'Snacks & Biscuits': 'స్నాక్స్ & బిస్కెట్లు',
      'Cleaning & Household': 'క్లీనింగ్ & హౌస్‌హోల్డ్',
      'Personal Care': 'వ్యక్తిగత సంరక్షణ',
      'General': 'ఇతరాలు'
    };

    function renderCategoriesScreen() {
      const container = document.getElementById('categoriesGrid');
      if (!container) return;

      const t = I18N[currentLang] || I18N.en;

      // Title & subtitle localization
      const titleEl = document.getElementById('categoriesViewTitle');
      const subEl = document.getElementById('categoriesViewSub');
      if (titleEl) titleEl.innerText = (currentLang === 'te' ? 'అన్ని కేటగిరీలు' : 'All Categories');
      if (subEl) subEl.innerText = (currentLang === 'te' ? 'కేటగిరీల వారీగా తాజా సరుకులను ఎంచుకోండి' : 'Browse fresh groceries by category');

      // Loading skeleton state
      if (!productsLoaded && Object.keys(categoriesCatalog).length === 0) {
        let skeletonHtml = '';
        for (let i = 0; i < 6; i++) {
          skeletonHtml += '<div class="category-tile category-tile-skeleton" aria-hidden="true"></div>';
        }
        container.innerHTML = skeletonHtml;
        return;
      }

      const catKeys = Object.keys(categoriesCatalog).sort((a,b) => (categoriesCatalog[a].order || 0) - (categoriesCatalog[b].order || 0));

      // Retry state if catalog load failed and 0 categories
      if (catKeys.length === 0 && productsLoaded) {
        container.innerHTML = \`
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; background: #fff; border-radius: 12px; border: 1px solid var(--border);">
            <div style="font-size: 36px; margin-bottom: 8px;">🏷️</div>
            <p style="font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 12px;">\${currentLang === 'te' ? 'కేటగిరీలు లోడ్ కాలేదు' : 'Could not load categories'}</p>
            <button id="retryCategoriesBtn" class="btn" style="background: var(--primary); color: #fff; min-height: 44px; padding: 0 20px;">
              \${t.retryBtn || (currentLang === 'te' ? 'మళ్ళీ ప్రయత్నించండి' : 'Retry')}
            </button>
          </div>
        \`;
        document.getElementById('retryCategoriesBtn')?.addEventListener('click', () => {
          initCatalogListeners();
          renderCategoriesScreen();
        });
        return;
      }

      // Compute available products (exclude out-of-stock items)
      const validProducts = Object.values(productsCatalog).filter(p => p && typeof p === 'object' && !isNaN(Number(p.price)));
      const availableProducts = validProducts.filter(p => p.inStock !== false);
      const totalCount = availableProducts.length;

      const itemsLabel = currentLang === 'te' ? 'వస్తువులు' : 'items';
      const itemLabel = currentLang === 'te' ? 'వస్తువు' : 'item';
      const notAvailLabel = currentLang === 'te' ? 'ప్రస్తుతం అందుబాటులో లేదు' : 'Not available now';
      const allCategoryName = currentLang === 'te' ? 'అన్ని వస్తువులు' : 'All items';

      // 1. First Tile: "All items"
      let tilesHtml = \`
        <div class="category-tile" data-cat="all" role="button" tabindex="0" aria-label="\${escapeHtml(allCategoryName)}, \${totalCount} \${totalCount === 1 ? itemLabel : itemsLabel}">
          <div class="category-tile-icon">🛒</div>
          <div class="category-tile-name">\${escapeHtml(allCategoryName)}</div>
          <div class="category-tile-count">\${totalCount} \${totalCount === 1 ? itemLabel : itemsLabel}</div>
        </div>
      \`;

      // 2. Loop through all owner-created categories
      catKeys.forEach(k => {
        const cat = categoriesCatalog[k];
        if (cat.active === false) return;

        const count = availableProducts.filter(p => p.categoryId === k).length;
        let name = cat.name || 'Category';
        if (currentLang === 'te') {
          name = cat.nameTe || DEFAULT_CAT_NAMES_TE[cat.name] || cat.name;
        }
        const icon = (cat.icon && cat.icon.trim()) ? cat.icon.trim() : (DEFAULT_CAT_ICONS[cat.name] || '🏷️');
        const isEmpty = (count === 0);

        tilesHtml += \`
          <div class="category-tile \${isEmpty ? 'empty-cat' : ''}" data-cat="\${escapeHtml(k)}" data-empty="\${isEmpty ? '1' : '0'}" data-name="\${escapeHtml(name)}" role="button" tabindex="0" aria-label="\${escapeHtml(name)}, \${isEmpty ? notAvailLabel : \`\${count} \${count === 1 ? itemLabel : itemsLabel}\`}">
            <div class="category-tile-icon">\${escapeHtml(icon)}</div>
            <div class="category-tile-name">\${escapeHtml(name)}</div>
            \${isEmpty 
              ? \`<span class="category-tile-badge-na">\${escapeHtml(notAvailLabel)}</span>\` 
              : \`<div class="category-tile-count">\${count} \${count === 1 ? itemLabel : itemsLabel}</div>\`
            }
          </div>
        \`;
      });

      container.innerHTML = tilesHtml;
    }

    function selectCategoryFromScreen(catId) {
      currentCategory = (catId === 'all' ? 'all' : catId);

      // Clear any active search query
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';

      // Switch to Home view
      const categoriesView = document.getElementById('categoriesView');
      const accountView = document.getElementById('accountView');
      const homeView = document.getElementById('homeView');
      if (categoriesView) categoriesView.style.display = 'none';
      if (accountView) accountView.style.display = 'none';
      if (homeView) homeView.style.display = 'block';

      setActiveNavTab('home');

      // Update URL with history push so phone back button returns to Categories screen
      const url = new URL(window.location);
      if (catId === 'all') {
        url.searchParams.delete('cat');
      } else {
        url.searchParams.set('cat', catId);
      }
      url.searchParams.delete('q');
      try {
        history.pushState({ tab: 'home', cat: catId, from: 'categories' }, '', url.toString());
      } catch (e) {}

      highlightActiveChip(catId);
      renderProducts();
      scrollToCategorySection(catId, true);
      syncBottomBar();
    }

    function openCategoriesScreen(fromTab) {
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
      document.body.classList.remove('modal-open', 'overlay-open', 'signin-open');

      const homeView = document.getElementById('homeView');
      const accountView = document.getElementById('accountView');
      const categoriesView = document.getElementById('categoriesView');

      if (homeView) homeView.style.display = 'none';
      if (accountView) accountView.style.display = 'none';
      if (categoriesView) categoriesView.style.display = 'block';

      setActiveNavTab('categories');
      renderCategoriesScreen();
      window.scrollTo({ top: 0, behavior: 'auto' });

      try {
        history.pushState({ tab: 'categories', from: fromTab || previousNavTab || 'home' }, '');
      } catch (e) {}

      syncBottomBar();
    }

    // Delegated click for category tiles
    document.getElementById('categoriesGrid')?.addEventListener('click', (e) => {
      const tile = e.target.closest('.category-tile');
      if (!tile) return;

      const catId = tile.getAttribute('data-cat');
      if (!catId) return;

      const isEmpty = tile.getAttribute('data-empty') === '1';
      const catName = tile.getAttribute('data-name') || 'This category';

      if (isEmpty) {
        showToast(currentLang === 'te' 
          ? \`"\${catName}" కేటగిరీలో ప్రస్తుతం వస్తువులు అందుబాటులో లేవు.\` 
          : \`No items available in "\${catName}" right now.\`);
        return;
      }

      selectCategoryFromScreen(catId);
    });

    // Categories Tab button click handler
    document.getElementById('bnavCategoriesBtn')?.addEventListener('click', () => {
      if (currentNavTab === 'categories') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      openCategoriesScreen(currentNavTab);
    });`;

html = replaceStrict(html, oldNavTarget, newNavReplacement, 'Categories Tab Controller');

// 8. Update navigateToHomeTop to also hide categoriesView
const navHomeTarget = `      // Switch to Home view
      const accountView = document.getElementById('accountView');
      const homeView = document.getElementById('homeView');
      if (accountView) accountView.style.display = 'none';
      if (homeView) homeView.style.display = 'block';`;

const navHomeReplacement = `      // Switch to Home view
      const accountView = document.getElementById('accountView');
      const categoriesView = document.getElementById('categoriesView');
      const homeView = document.getElementById('homeView');
      if (accountView) accountView.style.display = 'none';
      if (categoriesView) categoriesView.style.display = 'none';
      if (homeView) homeView.style.display = 'block';`;

html = replaceStrict(html, navHomeTarget, navHomeReplacement, 'navigateToHomeTop hide categoriesView');

// 9. Update bnavAccountBtn to also hide categoriesView
const bnavAccountTarget = `      document.getElementById('homeView').style.display = 'none';
      document.getElementById('accountView').style.display = 'block';
      setActiveNavTab('account');`;

const bnavAccountReplacement = `      document.getElementById('homeView').style.display = 'none';
      const categoriesView = document.getElementById('categoriesView');
      if (categoriesView) categoriesView.style.display = 'none';
      document.getElementById('accountView').style.display = 'block';
      setActiveNavTab('account');`;

html = replaceStrict(html, bnavAccountTarget, bnavAccountReplacement, 'bnavAccountBtn hide categoriesView');

// 10. Update popstate listener to handle Categories screen and back from filtered items
const popstateTarget = `    // Override popstate to handle Android back button from Account to Home
    window.addEventListener('popstate', (e) => {
      const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
      if (openModals.length > 0) {
        // Modal was closed by standard handler
        return;
      }
      if (currentNavTab === 'account') {
        // Android back button: return to Home view
        document.getElementById('accountView').style.display = 'none';
        document.getElementById('homeView').style.display = 'block';
        setActiveNavTab('home');
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(homeScrollY, maxScroll), behavior: 'auto' });
      }
    });`;

const popstateReplacement = `    // Override popstate to handle Android back button from Account and Categories to Home
    window.addEventListener('popstate', (e) => {
      const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
      if (openModals.length > 0) {
        // Modal was closed by standard handler
        return;
      }
      if (currentNavTab === 'account') {
        // Android back button: return to Home view
        document.getElementById('accountView').style.display = 'none';
        document.getElementById('homeView').style.display = 'block';
        setActiveNavTab('home');
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(homeScrollY, maxScroll), behavior: 'auto' });
        return;
      }
      if (currentNavTab === 'categories') {
        // Android back button from Categories screen: return to previous view without leaving site
        const categoriesView = document.getElementById('categoriesView');
        if (categoriesView) categoriesView.style.display = 'none';

        const returnTab = (previousNavTab === 'account') ? 'account' : 'home';
        if (returnTab === 'account') {
          document.getElementById('accountView').style.display = 'block';
          setActiveNavTab('account');
          renderAccountView();
        } else {
          document.getElementById('homeView').style.display = 'block';
          setActiveNavTab('home');
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          window.scrollTo({ top: Math.min(homeScrollY, maxScroll), behavior: 'auto' });
        }
        return;
      }
      if (currentNavTab === 'home' && e.state && e.state.from === 'categories') {
        // Back from filtered items returns to Categories screen
        openCategoriesScreen();
        return;
      }
    });`;

html = replaceStrict(html, popstateTarget, popstateReplacement, 'popstate listener');

// 11. Update setActiveNavTab to record 'categories' as previousNavTab
const setActiveNavTarget = `    function setActiveNavTab(tab, updatePrevious = true) {
      if (updatePrevious && tab !== currentNavTab && (currentNavTab === 'home' || currentNavTab === 'account')) {
        previousNavTab = currentNavTab;
      }`;

const setActiveNavReplacement = `    function setActiveNavTab(tab, updatePrevious = true) {
      if (updatePrevious && tab !== currentNavTab && (currentNavTab === 'home' || currentNavTab === 'account' || currentNavTab === 'categories')) {
        previousNavTab = currentNavTab;
      }`;

html = replaceStrict(html, setActiveNavTarget, setActiveNavReplacement, 'setActiveNavTab previousNavTab');

fs.writeFileSync('index.html', html, 'utf8');
console.log('ALL index.html modifications applied successfully!');
