const { chromium } = require('playwright');

async function testPage(url, viewport = { width: 1280, height: 800 }) {
  console.log(`\n========================================`);
  console.log(`TESTING URL: ${url} (viewport: ${viewport.width}x${viewport.height})`);
  console.log(`========================================`);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  const consoleLogs = [];
  const failedRequests = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text, location: msg.location() });
    if (type === 'error' || type === 'warning' || text.includes('Error') || text.includes('error')) {
      console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR]`, err.message, err.stack);
  });

  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure() });
    console.log(`[REQ FAILED] ${req.url()} - ${req.failure()?.errorText}`);
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  } catch (e) {
    console.log(`[NAVIGATION TIMEOUT/ERROR]: ${e.message}`);
  }

  // Wait 4 seconds for Firebase listeners to populate products
  await page.waitForTimeout(4000);

  // Check DOM elements
  const info = await page.evaluate(() => {
    const productsGrid = document.getElementById('productsGrid');
    const categoryChips = document.getElementById('categoryChipsBar');
    const catalogCards = document.querySelectorAll('.card');
    const emptyState = document.querySelector('.empty-state');
    const debugPanel = document.getElementById('catalogDebugPanel');

    return {
      title: document.title,
      productsGridExists: !!productsGrid,
      productsGridHtmlSnippet: productsGrid ? productsGrid.innerHTML.slice(0, 300) : null,
      cardCount: catalogCards.length,
      categoryChipsChildren: categoryChips ? categoryChips.children.length : 0,
      emptyStateText: emptyState ? emptyState.innerText.trim() : null,
      debugPanelVisible: debugPanel ? window.getComputedStyle(debugPanel).display : null,
      debugPanelText: debugPanel ? debugPanel.innerText.slice(0, 300) : null,
      productsLoaded: window.productsLoaded,
      categoriesCount: window.categoriesCatalog ? Object.keys(window.categoriesCatalog).length : 'undefined',
      productsCount: window.productsCatalog ? Object.keys(window.productsCatalog).length : 'undefined'
    };
  });

  console.log('PAGE DOM INSPECTION:', JSON.stringify(info, null, 2));
  console.log(`Total console logs: ${consoleLogs.length}`);
  console.log(`Total failed requests: ${failedRequests.length}`);

  await browser.close();
  return { consoleLogs, failedRequests, info };
}

async function run() {
  try {
    await testPage('http://localhost:8080/K-Stores/');
    await testPage('http://localhost:8080/K-Stores/?cat=cat_1791796976112');
    await testPage('http://localhost:8080/K-Stores/', { width: 360, height: 740 });
  } catch (err) {
    console.error('Test script runner error:', err);
  }
}

run();
