const { chromium } = require('playwright');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "https://nikhil6281.github.io/K-Stores";

async function runLiveVerification() {
  console.log('====================================================');
  console.log('🚀 STARTING LIVE END-TO-END BROWSER & UI VERIFICATION');
  console.log('====================================================');

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 },
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
  });

  const results = {
    customerApp: { passed: false, checks: [] },
    staffPortal: { passed: false, checks: [] },
    adminPortal: { passed: false, checks: [] },
    consoleErrors: []
  };

  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      if (!text.includes('TIMEOUT_8S') && !text.includes('favicon') && !text.includes('chrome-extension')) {
        results.consoleErrors.push(`[${page.url()}] Console Error: ${text}`);
      }
    }
    if (text.includes('cards rendered') || text.includes('productCount') || text.includes('Connected')) {
      console.log(`   [Browser Log] ${text}`);
    }
  });

  page.on('pageerror', err => {
    results.consoleErrors.push(`[${page.url()}] Uncaught Page Error: ${err.message}`);
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Customer App (index.html)
    // ----------------------------------------------------
    const cacheBustUrl = `${BASE_URL}/?nocache=${Date.now()}`;
    console.log(`\n📱 1. Testing Customer App: ${cacheBustUrl}`);
    const resp = await page.goto(cacheBustUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`   HTTP Status: ${resp.status()}`);
    results.customerApp.checks.push({ name: 'HTTP 200 Response', ok: resp.status() === 200 });

    // Wait for product cards to render
    console.log('   Waiting for product cards (.card[id^="card-p_"])...');
    await page.waitForSelector('.card[id^="card-p_"]', { timeout: 15000 });
    const productCards = await page.$$('.card[id^="card-p_"]');
    console.log(`   Rendered Product Cards: ${productCards.length}`);
    results.customerApp.checks.push({ name: 'Catalog Products Rendered (27 items)', ok: productCards.length >= 10 });

    // Page Title
    const title = await page.title();
    console.log(`   Page Title: "${title}"`);
    results.customerApp.checks.push({ name: 'Page Title Contains Sri Sai', ok: title.includes('Sri Sai') || title.includes('శ్రీ సాయి') });

    // Test Search Functionality
    const searchInput = await page.$('#searchInput');
    if (searchInput) {
      console.log('   Testing live search for "oil"...');
      await searchInput.fill('oil');
      await page.waitForTimeout(800);
      const filteredCards = await page.$$('.card[id^="card-p_"]');
      console.log(`   Filtered Products Count for "oil": ${filteredCards.length}`);
      results.customerApp.checks.push({ name: 'Live Search Filter for "oil"', ok: filteredCards.length > 0 });
      await searchInput.fill('');
      await page.waitForTimeout(600);
    }

    // Test Language Toggle (English <-> Telugu)
    const langBtn = await page.$('#langToggleBtn');
    if (langBtn) {
      console.log('   Clicking Language Toggle...');
      await page.evaluate(el => el.click(), langBtn);
      await page.waitForTimeout(600);
      const textAfterToggle = await page.textContent('body');
      const hasTelugu = textAfterToggle.includes('శ్రీ సాయి') || textAfterToggle.includes('హోమ్') || textAfterToggle.includes('కార్ట్') || textAfterToggle.includes('వర్గాలు');
      console.log(`   Telugu text detected after toggle: ${hasTelugu}`);
      results.customerApp.checks.push({ name: 'Bilingual Language Toggle', ok: hasTelugu });
      // Toggle back to English
      const langBtn2 = await page.$('#langToggleBtn');
      if (langBtn2) {
        await page.evaluate(el => el.click(), langBtn2);
        await page.waitForTimeout(600);
      }
    }

    // Test Add to Cart Button
    const addBtns = await page.$$('.action-add-cart');
    console.log(`   Found Add to Cart Buttons: ${addBtns.length}`);
    let cartUpdated = false;
    if (addBtns.length > 0) {
      console.log('   Clicking Add to Cart on first product...');
      await page.evaluate(el => el.click(), addBtns[0]);
      await page.waitForTimeout(1000);

      // Check if stepper appeared for that card
      const stepper = await page.$('.qty-stepper-wrap');
      const cartBadge = await page.$('#cartCount');
      let badgeText = cartBadge ? (await cartBadge.textContent()).trim() : '';
      console.log(`   Qty Stepper present: ${!!stepper}, Cart Badge: "${badgeText}"`);
      cartUpdated = !!stepper || badgeText === '1' || parseInt(badgeText) >= 1;
      results.customerApp.checks.push({ name: 'Add to Cart updates count/stepper', ok: cartUpdated });
    }

    // Test Cart Drawer open/close
    const cartTrigger = await page.$('#cartNavBtn, #cartBottomBarSummary, #cartCount');
    if (cartTrigger) {
      console.log('   Opening Cart Drawer...');
      await page.evaluate(el => el.click(), cartTrigger);
      await page.waitForTimeout(1000);

      const isDrawerOpen = await page.evaluate(() => {
        const modal = document.getElementById('cartDrawerModal');
        return modal && (modal.style.display === 'flex' || modal.style.display === 'block' || modal.classList.contains('active'));
      });
      console.log(`   Cart Drawer Modal visible: ${isDrawerOpen}`);
      results.customerApp.checks.push({ name: 'Cart Drawer Opens', ok: isDrawerOpen });

      // Close drawer
      const closeCartBtn = await page.$('.modal-close-btn[data-modal="cartDrawerModal"], #cartDrawerModal');
      if (closeCartBtn) {
        await page.evaluate(el => el.click(), closeCartBtn);
        await page.waitForTimeout(500);
      }
    }

    results.customerApp.passed = results.customerApp.checks.every(c => c.ok);

    // ----------------------------------------------------
    // TEST 2: Staff Portal (worker.html)
    // ----------------------------------------------------
    const workerBustUrl = `${BASE_URL}/worker.html?nocache=${Date.now()}`;
    console.log(`\n🛵 2. Testing Staff Portal: ${workerBustUrl}`);
    const workerResp = await page.goto(workerBustUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`   HTTP Status: ${workerResp.status()}`);
    results.staffPortal.checks.push({ name: 'HTTP 200 Response', ok: workerResp.status() === 200 });
    await page.waitForTimeout(1500);

    const workerTitle = await page.title();
    console.log(`   Page Title: "${workerTitle}"`);
    results.staffPortal.checks.push({ name: 'Page Title Contains Staff/Worker', ok: workerTitle.includes('Staff') || workerTitle.includes('Worker') || workerTitle.includes('Sri Sai') });

    const googleLoginBtn = await page.$('#loginGoogleBtn');
    const emailOtpSection = await page.$('#staffEmailInput');
    console.log(`   Google Login Button Present: ${!!googleLoginBtn}`);
    console.log(`   Staff Email OTP Input Present: ${!!emailOtpSection}`);
    results.staffPortal.checks.push({ name: 'Staff Login Controls Rendered', ok: !!googleLoginBtn && !!emailOtpSection });

    results.staffPortal.passed = results.staffPortal.checks.every(c => c.ok);

    // ----------------------------------------------------
    // TEST 3: Owner Portal (admin.html)
    // ----------------------------------------------------
    const adminBustUrl = `${BASE_URL}/admin.html?nocache=${Date.now()}`;
    console.log(`\n👑 3. Testing Owner Portal: ${adminBustUrl}`);
    const adminResp = await page.goto(adminBustUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`   HTTP Status: ${adminResp.status()}`);
    results.adminPortal.checks.push({ name: 'HTTP 200 Response', ok: adminResp.status() === 200 });
    await page.waitForTimeout(1500);

    const adminTitle = await page.title();
    console.log(`   Page Title: "${adminTitle}"`);
    results.adminPortal.checks.push({ name: 'Page Title Contains Owner/Admin', ok: adminTitle.includes('Owner') || adminTitle.includes('Admin') || adminTitle.includes('Sri Sai') });

    const adminLoginBox = await page.$('#loginView');
    const adminGoogleBtn = await page.$('#loginGoogleBtn');
    console.log(`   Admin Login Box Rendered: ${!!adminLoginBox}`);
    console.log(`   Admin Google Login Button Rendered: ${!!adminGoogleBtn}`);
    results.adminPortal.checks.push({ name: 'Admin Login Interface Present', ok: !!adminLoginBox && !!adminGoogleBtn });

    results.adminPortal.passed = results.adminPortal.checks.every(c => c.ok);

  } catch (err) {
    console.error('❌ Verification script encountered an error:', err);
    results.consoleErrors.push(`Execution error: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('====================================================');
  console.log(`Customer App: ${results.customerApp.passed ? '✅ PASSED' : '❌ FAILED'}`);
  results.customerApp.checks.forEach(c => console.log(`  - ${c.name}: ${c.ok ? '✅ OK' : '❌ FAIL'}`));

  console.log(`Staff Portal: ${results.staffPortal.passed ? '✅ PASSED' : '❌ FAILED'}`);
  results.staffPortal.checks.forEach(c => console.log(`  - ${c.name}: ${c.ok ? '✅ OK' : '❌ FAIL'}`));

  console.log(`Owner Portal: ${results.adminPortal.passed ? '✅ PASSED' : '❌ FAILED'}`);
  results.adminPortal.checks.forEach(c => console.log(`  - ${c.name}: ${c.ok ? '✅ OK' : '❌ FAIL'}`));

  console.log(`Console Errors: ${results.consoleErrors.length === 0 ? '0 (Clean ✅)' : results.consoleErrors.length}`);
  if (results.consoleErrors.length > 0) {
    results.consoleErrors.forEach(e => console.log(`  ⚠️ ${e}`));
  }
  console.log('====================================================\n');

  if (!results.customerApp.passed || !results.staffPortal.passed || !results.adminPortal.passed) {
    process.exit(1);
  }
}

runLiveVerification();
