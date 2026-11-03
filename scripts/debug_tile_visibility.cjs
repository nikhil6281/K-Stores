const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
  const page = await context.newPage();

  await page.goto('https://nikhil6281.github.io/K-Stores/');
  await page.waitForTimeout(4000);

  await page.click('#bnavCategoriesBtn');
  await page.waitForTimeout(1000);

  const tileInfo = await page.evaluate(() => {
    const tile = document.querySelector('.category-tile[data-cat="cat_1792562770313"]');
    const view = document.getElementById('categoriesView');
    const home = document.getElementById('homeView');
    if (!tile) return { error: 'Tile not found' };

    const rect = tile.getBoundingClientRect();
    const cs = window.getComputedStyle(tile);
    const viewCs = window.getComputedStyle(view);

    return {
      viewDisplay: viewCs.display,
      viewVisibility: viewCs.visibility,
      homeDisplay: window.getComputedStyle(home).display,
      tileDisplay: cs.display,
      tileVisibility: cs.visibility,
      tileOpacity: cs.opacity,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      windowScrollY: window.scrollY
    };
  });
  console.log('Tile Debug Info:', tileInfo);

  await browser.close();
})();

