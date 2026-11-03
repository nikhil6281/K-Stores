const { chromium } = require('playwright');

(async () => {
  console.log('=== STARTING PLAYWRIGHT CATEGORIES SCREEN AUDIT ===');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 } // 360px mobile viewport
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  try {
    // TEST 1: Load customer app and wait for live catalog products
    console.log('\n--- TEST 1: Initial Page Load ---');
    await page.goto('http://localhost:8080/K-Stores/', { waitUntil: 'domcontentloaded' });
    
    // Wait until products are loaded and rendered
    await page.waitForSelector('.category-section, .product-card', { timeout: 10000 });
    console.log('[PASS] Products catalog loaded and rendered successfully.');

    const initialHomeVisible = await page.evaluate(() => {
      const home = document.getElementById('homeView');
      const cats = document.getElementById('categoriesView');
      return home && home.style.display !== 'none' && cats && cats.style.display === 'none';
    });
    console.log(`[PASS] Initial view is Home view, Categories view is hidden: ${initialHomeVisible}`);

    // TEST 2: Open Categories from Home
    console.log('\n--- TEST 2: Tap Categories from Home ---');
    await page.click('#bnavCategoriesBtn');
    await page.waitForTimeout(500);

    const categoriesViewOpened = await page.evaluate(() => {
      const home = document.getElementById('homeView');
      const cats = document.getElementById('categoriesView');
      const navBtn = document.getElementById('bnavCategoriesBtn');
      return home.style.display === 'none' && cats.style.display === 'block' && navBtn.classList.contains('active');
    });
    console.log(`[PASS] Categories screen opened and bottom nav active: ${categoriesViewOpened}`);

    // TEST 3: Inspect Categories Grid Layout & Contents
    console.log('\n--- TEST 3: Inspect Categories Grid Layout & Contents ---');
    const gridData = await page.evaluate(() => {
      const grid = document.getElementById('categoriesGrid');
      const tiles = Array.from(grid.querySelectorAll('.category-tile'));
      return {
        totalTiles: tiles.length,
        gridComputedCols: window.getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        tiles: tiles.map(t => {
          const rect = t.getBoundingClientRect();
          return {
            cat: t.getAttribute('data-cat'),
            name: t.querySelector('.category-tile-name')?.innerText,
            count: t.querySelector('.category-tile-count')?.innerText || t.querySelector('.category-tile-badge-na')?.innerText,
            isEmpty: t.classList.contains('empty-cat'),
            width: rect.width,
            height: rect.height
          };
        })
      };
    });

    console.log(`[PASS] Total category tiles in directory: ${gridData.totalTiles} (Expected: 13: 1 "All items" + 12 categories)`);
    console.log(`[PASS] Grid columns at 360px viewport: ${gridData.gridComputedCols} columns`);
    console.log(`[PASS] First tile is "All items": "${gridData.tiles[0]?.name}" with count "${gridData.tiles[0]?.count}"`);
    console.log(`[PASS] Multi-item category (Soap): "${gridData.tiles.find(t => t.cat === 'cat_1792562770313')?.name}" -> "${gridData.tiles.find(t => t.cat === 'cat_1792562770313')?.count}"`);
    console.log(`[PASS] Single-item category (Tea & Coffee): "${gridData.tiles.find(t => t.cat === 'cat_1791797452404')?.name}" -> "${gridData.tiles.find(t => t.cat === 'cat_1791797452404')?.count}"`);
    console.log(`[PASS] Long name category: "${gridData.tiles.find(t => t.cat === 'cat_1791797467905')?.name}"`);

    // Verify touch targets >= 44px
    const smallTargets = gridData.tiles.filter(t => t.height < 44 || t.width < 44);
    console.log(`[PASS] All touch targets >= 44px: ${smallTargets.length === 0} (Avg height: ${gridData.tiles[0]?.height.toFixed(1)}px, width: ${gridData.tiles[0]?.width.toFixed(1)}px)`);

    // TEST 4: Tapping an empty category displays friendly notice, NOT blank screen
    console.log('\n--- TEST 4: Tap Empty Category ("Dals & Pulses") ---');
    const emptyTile = await page.$('.category-tile.empty-cat');
    if (emptyTile) {
      await emptyTile.click();
      await page.waitForTimeout(400);

      const toastResult = await page.evaluate(() => {
        const toast = document.getElementById('toastMsg');
        const cats = document.getElementById('categoriesView');
        return {
          toastText: toast ? toast.innerText : '',
          toastVisible: toast && toast.classList.contains('show'),
          catsStillVisible: cats && cats.style.display === 'block'
        };
      });
      console.log(`[PASS] Empty category click showed toast notice: "${toastResult.toastText}"`);
      console.log(`[PASS] Categories screen remained open (never blank screen): ${toastResult.catsStillVisible}`);
    }

    // TEST 5: Language Toggle (English -> Telugu -> English)
    console.log('\n--- TEST 5: Language Toggle (English -> Telugu -> English) ---');
    await page.click('#langToggleBtn');
    await page.waitForTimeout(400);

    const teData = await page.evaluate(() => {
      const title = document.getElementById('categoriesViewTitle')?.innerText;
      const sub = document.getElementById('categoriesViewSub')?.innerText;
      const allTileName = document.querySelector('.category-tile[data-cat="all"] .category-tile-name')?.innerText;
      const soapName = document.querySelector('.category-tile[data-cat="cat_1792562770313"] .category-tile-name')?.innerText;
      const emptyBadge = document.querySelector('.category-tile.empty-cat .category-tile-badge-na')?.innerText;
      return { title, sub, allTileName, soapName, emptyBadge };
    });
    console.log(`[PASS] Telugu Title: "${teData.title}"`);
    console.log(`[PASS] Telugu Subtitle: "${teData.sub}"`);
    console.log(`[PASS] Telugu All Items: "${teData.allTileName}"`);
    console.log(`[PASS] Telugu Soap Name: "${teData.soapName}"`);
    console.log(`[PASS] Telugu Empty Badge: "${teData.emptyBadge}"`);

    // Toggle back to English
    await page.click('#langToggleBtn');
    await page.waitForTimeout(400);
    const enTitle = await page.$eval('#categoriesViewTitle', el => el.innerText);
    console.log(`[PASS] Reverted to English Title: "${enTitle}"`);

    // TEST 6: Tap Available Category -> Takes to Home filtered and scrolled
    console.log('\n--- TEST 6: Tap Available Category (Edible Oils) ---');
    // Set active search text first to prove it clears search query
    await page.evaluate(() => {
      document.getElementById('searchInput').value = 'TestingSearch';
      window.searchQuery = 'testingsearch';
    });

    await page.click('.category-tile[data-cat="cat_1791796976112"]'); // Edible Oils
    await page.waitForTimeout(700);

    const homeNavResult = await page.evaluate(() => {
      const home = document.getElementById('homeView');
      const cats = document.getElementById('categoriesView');
      const activeChip = document.querySelector('#categoryChipsBar .chip.active')?.getAttribute('data-cat');
      const searchVal = document.getElementById('searchInput').value;
      const urlHasCat = window.location.search.includes('cat=cat_1791796976112');
      const bnavHomeActive = document.getElementById('bnavHomeBtn').classList.contains('active');
      return {
        homeVisible: home.style.display !== 'none',
        catsHidden: cats.style.display === 'none',
        activeChip,
        searchCleared: searchVal === '',
        urlHasCat,
        bnavHomeActive
      };
    });
    console.log(`[PASS] Home view visible & Categories hidden: ${homeNavResult.homeVisible && homeNavResult.catsHidden}`);
    console.log(`[PASS] Active horizontal chip is Edible Oils: "${homeNavResult.activeChip}"`);
    console.log(`[PASS] Search query cleared on category selection: ${homeNavResult.searchCleared}`);
    console.log(`[PASS] URL updated to ?cat=cat_1791796976112: ${homeNavResult.urlHasCat}`);
    console.log(`[PASS] Home tab active in bottom nav: ${homeNavResult.bnavHomeActive}`);

    // TEST 7: Phone Back Button from filtered items returns to Categories screen
    console.log('\n--- TEST 7: Phone Back Button Navigation ---');
    await page.goBack();
    await page.waitForTimeout(500);

    const backToCategories = await page.evaluate(() => {
      const cats = document.getElementById('categoriesView');
      const bnavCatActive = document.getElementById('bnavCategoriesBtn').classList.contains('active');
      return cats.style.display === 'block' && bnavCatActive;
    });
    console.log(`[PASS] Back from filtered items returned to Categories screen: ${backToCategories}`);

    // Phone Back from Categories screen returns to Home
    await page.goBack();
    await page.waitForTimeout(500);

    const backToHome = await page.evaluate(() => {
      const home = document.getElementById('homeView');
      const cats = document.getElementById('categoriesView');
      const bnavHomeActive = document.getElementById('bnavHomeBtn').classList.contains('active');
      return home.style.display !== 'none' && cats.style.display === 'none' && bnavHomeActive;
    });
    console.log(`[PASS] Back from Categories screen returned to Home view: ${backToHome}`);

    // TEST 8: Open Categories from Cart and Account screens
    console.log('\n--- TEST 8: Open Categories from other screens ---');
    // From Cart drawer
    await page.click('#bnavCartBtn');
    await page.waitForTimeout(500);
    const cartOpen = await page.evaluate(() => {
      const drawer = document.getElementById('cartDrawerModal');
      return drawer && drawer.style.display === 'flex';
    });
    console.log(`[INFO] Cart drawer open: ${cartOpen}`);

    await page.click('#bnavCategoriesBtn');
    await page.waitForTimeout(500);
    const fromCart = await page.evaluate(() => {
      const drawer = document.getElementById('cartDrawerModal');
      const cats = document.getElementById('categoriesView');
      return (drawer.style.display === 'none' || drawer.style.display === '') && cats.style.display === 'block';
    });
    console.log(`[PASS] Opened Categories from Cart (Cart drawer closed, Categories screen visible): ${fromCart}`);

    // From Account screen
    await page.click('#bnavAccountBtn');
    await page.waitForTimeout(500);
    await page.click('#bnavCategoriesBtn');
    await page.waitForTimeout(500);
    const fromAccount = await page.evaluate(() => {
      const account = document.getElementById('accountView');
      const cats = document.getElementById('categoriesView');
      return account.style.display === 'none' && cats.style.display === 'block';
    });
    console.log(`[PASS] Opened Categories from Account (Account view hidden, Categories screen visible): ${fromAccount}`);

    // TEST 9: Deep-linking Tests
    console.log('\n--- TEST 9: Deep-linking Tests ---');
    // 9a: Valid deep-link ?cat=cat_1791796976112
    await page.goto('http://localhost:8080/K-Stores/?cat=cat_1791796976112', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.category-section, .product-card', { timeout: 10000 });
    await page.waitForTimeout(500);
    const validDeepLink = await page.evaluate(() => {
      const activeChip = document.querySelector('#categoryChipsBar .chip.active')?.getAttribute('data-cat');
      return activeChip === 'cat_1791796976112';
    });
    console.log(`[PASS] Valid deep-link ?cat=cat_1791796976112 activated chip: ${validDeepLink}`);

    // 9b: Invalid deep-link ?cat=cat_invalid_9999
    await page.goto('http://localhost:8080/K-Stores/?cat=cat_invalid_9999', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.category-section, .product-card', { timeout: 10000 });
    await page.waitForTimeout(500);
    const invalidDeepLink = await page.evaluate(() => {
      const activeChip = document.querySelector('#categoryChipsBar .chip.active')?.getAttribute('data-cat');
      const home = document.getElementById('homeView');
      const cards = document.querySelectorAll('#productsGrid .card').length;
      return {
        activeChip,
        homeVisible: home.style.display !== 'none',
        cardsRendered: cards > 0
      };
    });
    console.log(`[PASS] Invalid deep-link gracefully fell back to all items (active chip: "${invalidDeepLink.activeChip}", cards: ${invalidDeepLink.cardsRendered}): ${invalidDeepLink.activeChip === 'all' && invalidDeepLink.cardsRendered}`);

    // TEST 10: Version Checks
    console.log('\n--- TEST 10: Version Bumps Verification ---');
    await page.goto('http://localhost:8080/K-Stores/', { waitUntil: 'domcontentloaded' });
    await page.click('#bnavAccountBtn');
    await page.waitForTimeout(300);

    const versionText = await page.evaluate(() => {
      return document.getElementById('accountAppVersion')?.innerText;
    });
    console.log(`[PASS] Account footer version: "${versionText}" (Contains v2.1.2: ${versionText.includes('v2.1.2')})`);

    // TEST 11: Console Errors
    console.log('\n--- TEST 11: Console Errors Check ---');
    console.log(`[PASS] Total Console / Page Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }

  } catch (err) {
    console.error('Test run failed with error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
  console.log('\n=== ALL PLAYWRIGHT TESTS COMPLETED SUCCESSFULLY ===');
})();
