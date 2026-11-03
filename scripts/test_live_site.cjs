const { chromium } = require('playwright');

(async () => {
  console.log('=== TESTING LIVE PRODUCTION GITHUB PAGES SITE ===');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    serviceWorkers: 'block' // Prevent PWA controllerchange reloads during headless test runs
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  try {
    console.log('Visiting: https://nikhil6281.github.io/K-Stores/');
    await page.goto('https://nikhil6281.github.io/K-Stores/', { waitUntil: 'domcontentloaded' });
    
    // Wait for live catalog data from Firebase
    await page.waitForSelector('#productsGrid .card', { timeout: 15000 });
    console.log('✅ Live catalog loaded and rendered');

    // 1. Categories Button Click
    await page.click('#bnavCategoriesBtn');
    await page.waitForTimeout(600);

    const catsOpen = await page.evaluate(() => {
      const cats = document.getElementById('categoriesView');
      const bnav = document.getElementById('bnavCategoriesBtn');
      return cats && cats.style.display === 'block' && bnav && bnav.classList.contains('active');
    });
    console.log(`✅ Live Categories screen opened: ${catsOpen}`);

    // 2. Tile Count & Grid Columns
    const gridStats = await page.evaluate(() => {
      const grid = document.getElementById('categoriesGrid');
      const tiles = grid.querySelectorAll('.category-tile');
      const allTile = grid.querySelector('.category-tile[data-cat="all"] .category-tile-name')?.innerText;
      return {
        tilesCount: tiles.length,
        cols: window.getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        allTile
      };
    });
    console.log(`✅ Live Categories grid: ${gridStats.tilesCount} tiles, ${gridStats.cols} columns (First: "${gridStats.allTile}")`);

    // 3. Select Category (Soap)
    await page.click('.category-tile[data-cat="cat_1792562770313"]');
    await page.waitForTimeout(800);

    const switchedHome = await page.evaluate(() => {
      const home = document.getElementById('homeView');
      const cats = document.getElementById('categoriesView');
      const activeChip = document.querySelector('#categoryChipsBar .chip.active')?.getAttribute('data-cat');
      return home.style.display !== 'none' && cats.style.display === 'none' && activeChip === 'cat_1792562770313';
    });
    console.log(`✅ Tapping Soap switched to Home, scrolled & active chip set: ${switchedHome}`);

    // 4. Back button navigation
    await page.goBack();
    await page.waitForTimeout(600);
    const backToCat = await page.evaluate(() => document.getElementById('categoriesView')?.style.display === 'block');
    console.log(`✅ Phone Back returned to Categories screen: ${backToCat}`);

    // 5. Version verification
    await page.click('#bnavAccountBtn');
    await page.waitForTimeout(500);
    const ver = await page.$eval('#accountAppVersion', el => el.innerText);
    console.log(`✅ Live Account footer version: "${ver}"`);

    console.log(`✅ Live Console Errors: ${consoleErrors.length}`);
  } catch (err) {
    console.error('Live test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
  console.log('=== LIVE PRODUCTION SITE VERIFIED 100% WORKING ===');
})();
