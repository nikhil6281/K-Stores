const { chromium } = require('playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');

async function runMobileE2ETests() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath.startsWith('/K-Stores/')) {
      reqPath = reqPath.replace('/K-Stores/', '/');
    }
    const filePath = path.join(process.cwd(), reqPath === '/' ? 'index.html' : reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise((resolve) => server.listen(8080, resolve));

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const viewports = [
    { name: 'Android Compact (360x800)', width: 360, height: 800 },
    { name: 'iPhone Standard (390x844)', width: 390, height: 844 }
  ];

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(message);
    }
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  }

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`📱 TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
    });

    const page = await context.newPage();

    // -----------------------------------------------------------------
    // TEST 1: CUSTOMER APP INITIAL LOAD & BRANDING (ITEM 4 & 7)
    // -----------------------------------------------------------------
    console.log('\n[1] Testing Customer App Home & Branding (Items 4 & 7)...');
    await page.goto('http://localhost:8080/K-Stores/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const title = await page.title();
    assert(title.includes('Sri Sai'), `Page title contains "Sri Sai" (got: "${title}")`);
    assert(!title.includes('RA Store'), 'Page title has no "RA Store"');

    const brandTitle = await page.textContent('#navbarBrandTitle');
    assert(brandTitle.trim() === 'Sri Sai', `Navbar brand title is "Sri Sai" (got: "${brandTitle.trim()}")`);

    // Verify logo image is loaded and rendered
    const logoLoaded = await page.evaluate(() => {
      const img = document.querySelector('.navbar .brand img');
      return img && img.complete && img.naturalWidth > 0 && img.src.includes('sri-sai-logo.png');
    });
    assert(logoLoaded, 'Sri Sai logo in navbar renders with natural dimensions > 0');

    // -----------------------------------------------------------------
    // TEST 2: ORDERS SCREEN LOADING & TIMEOUT (ITEM 1)
    // -----------------------------------------------------------------
    console.log('\n[2] Testing Orders Screen Opening & Signed-out State (Item 1)...');
    const startOrdersTime = Date.now();
    await page.click('#bnavOrdersBtn');
    await page.waitForSelector('#ordersModal', { state: 'visible', timeout: 3000 });
    const ordersOpenDuration = Date.now() - startOrdersTime;
    assert(ordersOpenDuration < 2000, `Orders modal opens within 2s (opened in ${ordersOpenDuration}ms)`);

    // Check signed-out helpful state inside customerOrdersList
    const ordersListHtml = await page.innerHTML('#customerOrdersList');
    assert(ordersListHtml.includes('Sign in to see your orders'), 'Orders shows explicit "Sign in to see your orders" when signed out');
    assert(!ordersListHtml.includes('Loading orders...'), 'Orders does NOT stay stuck on "Loading orders..."');

    // Check "Sign In" button inside orders modal triggers login modal
    await page.click('#ordersSignInPromptBtn');
    await page.waitForSelector('#loginModal', { state: 'visible', timeout: 3000 });
    const loginModalVisible = await page.isVisible('#loginModal');
    assert(loginModalVisible, 'Sign In button inside Orders screen opens login modal');

    // Close login modal
    await page.click('#loginModal .modal-close-btn');
    await page.waitForTimeout(400);

    // -----------------------------------------------------------------
    // TEST 3: AUTH MODAL - EMAIL OTP & GOOGLE (ITEM 6)
    // -----------------------------------------------------------------
    console.log('\n[3] Testing Auth Modal: Email OTP + Google Login (Item 6)...');
    // Open login modal via account or header button
    await page.click('#loginBtn');
    await page.waitForSelector('#loginModal', { state: 'visible', timeout: 3000 });

    const googleBtnVisible = await page.isVisible('#loginGoogleBtn');
    assert(googleBtnVisible, 'Google Sign In button is present and visible');

    const emailInputVisible = await page.isVisible('#loginEmailInput');
    assert(emailInputVisible, 'Email input field is present');

    const sendEmailOtpBtnVisible = await page.isVisible('#sendEmailOtpBtn');
    assert(sendEmailOtpBtnVisible, '"Send 6-Digit Code" button is present');

    // Ensure phone input & SMS buttons are gone
    const phoneInput = await page.$('#loginPhoneInput');
    assert(!phoneInput, 'Old phone number input is completely removed');
    const recaptchaContainer = await page.$('#recaptcha-container');
    assert(!recaptchaContainer, 'reCAPTCHA container is completely removed');

    // Test client validation on empty / invalid email
    let alertText = '';
    page.once('dialog', async d => {
      alertText = d.message();
      await d.accept();
    });
    await page.click('#sendEmailOtpBtn');
    await page.waitForTimeout(300);
    assert(alertText.includes('valid email'), `Invalid email triggers validation message (got: "${alertText}")`);

    // Close login modal
    await page.click('#loginModal .modal-close-btn');
    await page.waitForTimeout(400);

    // -----------------------------------------------------------------
    // TEST 4: BOTTOM BAR POP-OUT & POP-IN (ITEM 3)
    // -----------------------------------------------------------------
    console.log('\n[4] Testing Bottom Bar Pop-Out / Pop-In Behavior (Item 3)...');
    // Close orders modal if still open
    const isOrdersOpen = await page.isVisible('#ordersModal');
    if (isOrdersOpen) {
      await page.click('#ordersModal .modal-close-btn');
      await page.waitForTimeout(400);
    }

    // Verify bottom bar is visible on home
    let bnavHidden = await page.evaluate(() => document.body.classList.contains('bnav-hidden'));
    assert(!bnavHidden, 'Bottom nav is visible on Home screen (bnav-hidden not present)');

    // Tap Cart -> Bottom bar must pop out (slide out / hide)
    await page.click('#bnavCartBtn');
    await page.waitForTimeout(400);
    const cartOpen = await page.isVisible('#cartDrawerModal');
    assert(cartOpen, 'Cart drawer is open');
    bnavHidden = await page.evaluate(() => document.body.classList.contains('bnav-hidden'));
    assert(bnavHidden, 'Bottom nav pops out (body has bnav-hidden) when Cart is open');

    // Close Cart drawer -> Bottom bar must pop back in
    await page.click('#cartDrawerModal .modal-close-btn');
    await page.waitForTimeout(400);
    bnavHidden = await page.evaluate(() => document.body.classList.contains('bnav-hidden'));
    assert(!bnavHidden, 'Bottom nav pops back in (bnav-hidden removed) after closing Cart');

    // Verify active nav tab is synced back to home
    const activeTab = await page.evaluate(() => {
      const activeEl = document.querySelector('.bottom-nav-item.active');
      return activeEl ? activeEl.getAttribute('data-tab') : null;
    });
    assert(activeTab === 'home', `Active bottom nav tab restored to "home" (got: "${activeTab}")`);

    // -----------------------------------------------------------------
    // TEST 5: ORDER SORTING LOGIC VERIFICATION (ITEM 2)
    // -----------------------------------------------------------------
    console.log('\n[5] Testing Newest-First Sorting Logic (Item 2)...');
    const sortTestResult = await page.evaluate(() => {
      const mockOrders = {
        order1: { id: 'ORD-1', createdAt: '2026-11-01T10:00:00Z', total: 100 },
        order2: { id: 'ORD-2', createdAt: '2026-11-04T12:00:00Z', total: 200 },
        order3: { id: 'ORD-3', timestamp: 1730700000000, total: 150 }
      };
      const entries = Object.entries(mockOrders);
      entries.sort((a, b) => getOrderTimestamp(b[1]) - getOrderTimestamp(a[1]));
      return entries.map(e => e[1].id);
    });
    assert(sortTestResult[0] === 'ORD-2', `Newest order is sorted first (got: "${sortTestResult[0]}")`);

    // -----------------------------------------------------------------
    // TEST 6: ADMIN PORTAL MOBILE VERIFICATION (ITEMS 1, 2, 4 & 7)
    // -----------------------------------------------------------------
    console.log('\n[6] Testing Admin Portal on Mobile (Items 1, 2, 4 & 7)...');
    await page.goto('http://localhost:8080/K-Stores/admin.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const adminTitle = await page.title();
    assert(adminTitle.includes('Sri Sai'), `Admin title contains "Sri Sai" (got: "${adminTitle}")`);

    const adminLogoLoaded = await page.evaluate(() => {
      const img = document.querySelector('img[src*="sri-sai-logo"]');
      return img && img.complete && img.naturalWidth > 0;
    });
    assert(adminLogoLoaded, 'Admin header logo renders properly');

    const adminHtml = fs.readFileSync('admin.html', 'utf8');
    assert(adminHtml.includes('const sortNewestFirst = (a, b) => getOrderTimestamp(allOrders[b]) - getOrderTimestamp(allOrders[a]);'), 'Admin portal sorts orders newest first');
    assert(adminHtml.includes('activeCod = codKeys.filter(k => isActive(allOrders[k])).sort(sortNewestFirst)'), 'Admin active COD sorted newest first');
    assert(adminHtml.includes('completedCod = codKeys.filter(k => !isActive(allOrders[k])).sort(sortNewestFirst)'), 'Admin completed COD sorted newest first');

    // -----------------------------------------------------------------
    // TEST 7: WORKER PORTAL MOBILE VERIFICATION (ITEMS 1, 2, 4 & 7)
    // -----------------------------------------------------------------
    console.log('\n[7] Testing Worker Portal on Mobile (Items 1, 2, 4 & 7)...');
    await page.goto('http://localhost:8080/K-Stores/worker.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const workerTitle = await page.title();
    assert(workerTitle.includes('Sri Sai'), `Worker title contains "Sri Sai" (got: "${workerTitle}")`);

    const workerBuildLabel = await page.textContent('#dbgBuild');
    assert(workerBuildLabel.includes('SRI-SAI-STAFF'), `Worker build label is updated (got: "${workerBuildLabel.trim()}")`);

    // Verify Worker Email OTP input exists and phone input is gone
    const workerEmailInput = await page.$('#staffEmailInput');
    assert(workerEmailInput !== null, 'Worker portal has Email input');
    const workerPhoneInput = await page.$('#workerPhoneInput');
    assert(workerPhoneInput === null, 'Worker portal old phone input removed');

    await context.close();
  }

  await browser.close();
  server.close();

  console.log(`\n======================================================`);
  console.log(`🎉 ALL MOBILE E2E TESTS COMPLETED: ${passedTests}/${totalTests} PASSED!`);
  console.log(`======================================================\n`);
}

runMobileE2ETests().catch(err => {
  console.error('Mobile E2E Tests Error:', err);
  process.exit(1);
});
