const { chromium } = require('playwright');

async function testAdmin() {
  console.log('Testing admin.html buttons...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('net::ERR_')) {
      errors.push(msg.text());
    }
  });

  await page.goto('http://localhost:8080/K-Stores/admin.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const tabs = ['alerts', 'orders', 'products', 'categories', 'customers', 'reports', 'misses', 'settings', 'staff'];
  const results = [];

  for (const tab of tabs) {
    try {
      const btn = await page.$(`button[data-tab="${tab}"]`);
      if (!btn) {
        results.push({ tab, status: 'FAIL', error: 'tab button not found' });
        continue;
      }
      await btn.click();
      await page.waitForTimeout(200);
      const isVisible = await page.$eval(`#tab-${tab}`, el => el.style.display !== 'none');
      results.push({ tab, status: isVisible ? 'PASS' : 'FAIL', error: isVisible ? '' : 'pane not visible' });
    } catch (e) {
      results.push({ tab, status: 'FAIL', error: e.message });
    }
  }

  // Modals in admin
  const modalBtns = [
    { name: 'Open Add Product Modal', open: '#openAddProductModalBtn', close: 'button[data-modal="productModal"]', modal: '#productModal' },
    { name: 'Open Add Category Modal', open: '#openAddCategoryModalBtn', close: 'button[data-modal="categoryModal"]', modal: '#categoryModal' }
  ];

  for (const m of modalBtns) {
    try {
      await page.click(m.open);
      await page.waitForTimeout(200);
      const openDisplay = await page.$eval(m.modal, el => el.style.display);
      await page.click(m.close);
      await page.waitForTimeout(200);
      const closeDisplay = await page.$eval(m.modal, el => el.style.display);
      const ok = openDisplay !== 'none' && closeDisplay === 'none';
      results.push({ name: m.name, status: ok ? 'PASS' : 'FAIL', error: ok ? '' : 'modal open/close failed' });
    } catch (e) {
      results.push({ name: m.name, status: 'FAIL', error: e.message });
    }
  }

  console.log('Admin results:', results);
  console.log('Admin errors:', errors);
  await browser.close();
}

testAdmin().catch(console.error);
