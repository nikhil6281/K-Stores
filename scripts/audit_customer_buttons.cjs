const { chromium } = require('playwright');

async function audit() {
  console.log('🚀 Starting Comprehensive Customer Button Playwright Audit...');

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 412, height: 915 } // Mobile viewport
  });

  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push({ type: 'pageerror', msg: err.message, stack: err.stack });
    console.error('  [PAGE JS ERROR]:', err.message);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Only capture script execution errors, not external image 404/timeouts
      if (!text.includes('net::ERR_') && !text.includes('favicon.ico')) {
        pageErrors.push({ type: 'console.error', msg: text });
        console.error('  [CONSOLE ERROR]:', text);
      }
    }
  });

  console.log('Loading http://localhost:8080/K-Stores/ ...');
  await page.goto('http://localhost:8080/K-Stores/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const results = [];

  async function testBtn(name, selectorOrFn, expectedBehavior) {
    const errBefore = pageErrors.length;
    let status = 'PASS';
    let detail = '';

    try {
      if (typeof selectorOrFn === 'string') {
        const el = await page.$(selectorOrFn);
        if (!el) {
          throw new Error(`Element ${selectorOrFn} not found in DOM`);
        }
        await el.click();
      } else {
        await selectorOrFn();
      }
      await page.waitForTimeout(400);

      const newErrors = pageErrors.slice(errBefore);
      if (newErrors.length > 0) {
        status = 'FAIL';
        detail = newErrors.map(e => e.msg).join('; ');
      }
    } catch (e) {
      status = 'FAIL';
      detail = e.message;
    }

    results.push({
      page: 'Customer (index.html)',
      button: name,
      expected: expectedBehavior,
      status,
      detail
    });
    console.log(`${status === 'PASS' ? '✅' : '❌'} [${status}] ${name}: ${detail || 'OK'}`);
  }

  // 1. Language Toggle: Telugu to English and back
  await testBtn('Language Toggle (#langToggleBtn)', async () => {
    await page.click('#langToggleBtn');
    await page.waitForTimeout(200);
    const text1 = await page.$eval('#langToggleBtn', el => el.innerText);
    await page.click('#langToggleBtn');
    await page.waitForTimeout(200);
  }, 'Toggles language between Telugu and English, updates landmarks, category labels and UI');

  // 2. Search Input & Clear
  await testBtn('Search & Clear (#searchInput, #searchClearBtn)', async () => {
    await page.fill('#searchInput', 'Rice');
    await page.waitForTimeout(300);
    const clearBtn = await page.$('#searchClearBtn');
    if (!clearBtn) throw new Error('#searchClearBtn not found');
    await clearBtn.click();
    await page.waitForTimeout(200);
  }, 'Filters catalog by search term in real time, clear button resets search');

  // 3. Category Chip click
  await testBtn('Category Chip (#categoryChipsBar .chip)', async () => {
    const chips = await page.$$('#categoryChipsBar .chip');
    if (chips.length < 2) throw new Error('Not enough category chips rendered');
    await chips[1].click();
    await page.waitForTimeout(200);
    await chips[0].click(); // Reset to All
  }, 'Filters product grid to selected category and scrolls smoothly');

  // 4. Bottom Nav: Categories Tab
  await testBtn('Bottom Nav: Categories Tab (#bnavCategoriesBtn)', async () => {
    await page.click('#bnavCategoriesBtn');
  }, 'Scrolls to and focuses the category selector bar');

  // 5. Product Card Add to Cart
  await testBtn('Add to Cart (.action-add-cart)', async () => {
    const addBtn = await page.$('.action-add-cart');
    if (!addBtn) throw new Error('No .action-add-cart found on page');
    await addBtn.click();
    await page.waitForTimeout(300);
  }, 'Adds item to cart, increments badge, displays quantity stepper, shows floating cart bar');

  // 6. Quantity Stepper (+)
  await testBtn('Quantity Stepper Increment (.action-qty[data-delta="1"])', async () => {
    const plusBtn = await page.$('.action-qty[data-delta="1"]');
    if (!plusBtn) throw new Error('Plus stepper button not found');
    await plusBtn.click();
    await page.waitForTimeout(200);
  }, 'Increases item quantity by 1 and updates subtotal');

  // 7. Quantity Stepper (-)
  await testBtn('Quantity Stepper Decrement (.action-qty[data-delta="-1"])', async () => {
    const minusBtn = await page.$('.action-qty[data-delta="-1"]');
    if (!minusBtn) throw new Error('Minus stepper button not found');
    await minusBtn.click();
    await page.waitForTimeout(200);
  }, 'Decreases item quantity by 1 and updates subtotal');

  // 8. View Cart Floating Bar
  await testBtn('View Cart Bar (#cartBottomBar)', async () => {
    // Click inner summary to avoid any border overlay
    await page.click('#cartBottomBarSummary');
    await page.waitForTimeout(300);
    const display = await page.$eval('#cartDrawerModal', el => el.style.display);
    if (display === 'none') throw new Error('Cart drawer modal did not open');
  }, 'Opens slide-up Cart Drawer with item breakdown, free delivery progress, and total');

  // 9. Cart Drawer Close Button
  await testBtn('Cart Drawer Close (#cartDrawerModal .modal-close-btn)', async () => {
    const closeBtn = await page.$('#cartDrawerModal .modal-close-btn');
    if (!closeBtn) throw new Error('Cart drawer close button not found');
    await closeBtn.click();
    await page.waitForTimeout(300);
    const display = await page.$eval('#cartDrawerModal', el => el.style.display);
    if (display !== 'none') throw new Error('Cart drawer failed to close');
  }, 'Closes cart drawer and restores main view');

  // 10. Re-open Drawer and Proceed to Checkout
  await testBtn('Cart Drawer Proceed to Checkout (#cartDrawerCheckoutBtn)', async () => {
    await page.click('#cartBottomBarSummary');
    await page.waitForTimeout(200);
    await page.click('#cartDrawerCheckoutBtn');
    await page.waitForTimeout(300);
    const display = await page.$eval('#checkoutModal', el => el.style.display);
    if (display === 'none') throw new Error('Checkout modal did not open');
  }, 'Validates minimum order threshold, closes cart drawer and opens Delivery Details checkout modal');

  // 11. Checkout: Quick Landmark Chips
  await testBtn('Checkout Landmark Chips (.btn-quick-landmark)', async () => {
    const chips = await page.$$('.btn-quick-landmark');
    if (chips.length === 0) throw new Error('No landmark chips found in checkout modal');
    await chips[0].click();
    await page.waitForTimeout(100);
    const addr = await page.$eval('#custAddress', el => el.value);
    if (!addr) throw new Error('Landmark chip did not append to address input');
  }, 'Appends popular Anantapur landmark to address field for faster checkout');

  // 12. Checkout: Payment Method Radios (COD / Online)
  await testBtn('Checkout Payment Method Radios (#payMethodOnline, #payMethodCod)', async () => {
    await page.click('#payMethodOnline');
    await page.waitForTimeout(100);
    const isOnline = await page.$eval('#payMethodOnline', el => el.checked);
    if (!isOnline) throw new Error('Online radio was not checked');
    await page.click('#payMethodCod');
    await page.waitForTimeout(100);
    const isCod = await page.$eval('#payMethodCod', el => el.checked);
    if (!isCod) throw new Error('COD radio was not checked');
  }, 'Selects Cash on Delivery (COD) or Online Razorpay payment method');

  // 13. Checkout Modal Close Button
  await testBtn('Checkout Modal Close (#checkoutModal .modal-close-btn)', async () => {
    await page.click('#checkoutModal .modal-close-btn');
    await page.waitForTimeout(300);
    const display = await page.$eval('#checkoutModal', el => el.style.display);
    if (display !== 'none') throw new Error('Checkout modal did not close');
  }, 'Closes checkout modal without placing order or losing cart items');

  // 14. Header Sign In Button
  await testBtn('Header Sign In Button (#loginBtn)', async () => {
    await page.click('#loginBtn');
    await page.waitForTimeout(300);
    const display = await page.$eval('#loginModal', el => el.style.display);
    if (display === 'none') throw new Error('Login modal did not open');
  }, 'Opens Phone OTP / Google Sign In modal');

  // 15. Login Modal Close Button
  await testBtn('Login Modal Close (#loginModalCloseBtn)', async () => {
    await page.click('#loginModalCloseBtn');
    await page.waitForTimeout(300);
    const display = await page.$eval('#loginModal', el => el.style.display);
    if (display !== 'none') throw new Error('Login modal did not close');
  }, 'Closes authentication modal safely');

  // 16. Bottom Nav: Orders Tab (Signed out)
  await testBtn('Bottom Nav: Orders Tab (#bnavOrdersBtn)', async () => {
    await page.click('#bnavOrdersBtn');
    await page.waitForTimeout(300);
    // Since user is not logged in, should prompt login modal
    const loginOpen = await page.$eval('#loginModal', el => el.style.display);
    if (loginOpen === 'none') throw new Error('Login modal was not prompted for unauthenticated orders view');
    await page.click('#loginModalCloseBtn');
    await page.waitForTimeout(200);
  }, 'Prompts login modal when signed out; displays live tracked orders and order history when signed in');

  // 17. Bottom Nav: Account Tab
  await testBtn('Bottom Nav: Account Tab (#bnavAccountBtn)', async () => {
    await page.click('#bnavAccountBtn');
    await page.waitForTimeout(300);
    const accountDisplay = await page.$eval('#accountView', el => el.style.display);
    if (accountDisplay === 'none') throw new Error('Account view did not display');
  }, 'Switches main view to Account dashboard with saved addresses, notification toggles, policies and app version');

  // 18. Account Notification Toggles
  await testBtn('Account Notification Toggles (#toggleNotifOrderUpdates, #toggleNotifOffers)', async () => {
    const notifToggle = await page.$('#toggleNotifOrderUpdates');
    if (notifToggle) await notifToggle.click();
    await page.waitForTimeout(100);
    const offerToggle = await page.$('#toggleNotifOffers');
    if (offerToggle) await offerToggle.click();
    await page.waitForTimeout(100);
  }, 'Toggles customer push notification preferences for order status updates and promotional offers');

  // 19. Bottom Nav: Home Tab
  await testBtn('Bottom Nav: Home Tab (#bnavHomeBtn)', async () => {
    await page.click('#bnavHomeBtn');
    await page.waitForTimeout(300);
    const homeDisplay = await page.$eval('#homeView', el => el.style.display);
    if (homeDisplay === 'none') throw new Error('Home view did not display');
  }, 'Switches back from Account view to Home store catalog view');

  // 20. Cart Clear Button
  await testBtn('Cart Drawer Clear Button (#cartDrawerClearBtn)', async () => {
    await page.click('#cartBottomBarSummary');
    await page.waitForTimeout(200);
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('#cartDrawerClearBtn');
    await page.waitForTimeout(300);
    // Drawer should auto close or be empty
    const countBadge = await page.$eval('#cartDrawerItemCountBadge', el => el.innerText);
    if (!countBadge.includes('0')) throw new Error('Cart was not cleared to 0 items');
    await page.click('#cartDrawerModal .modal-close-btn');
  }, 'Clears all items from cart with confirmation dialog and resets cart bottom bar');

  console.log('\n========================================');
  console.log('CUSTOMER AUDIT RESULTS:');
  console.log('========================================');
  let passCount = 0;
  let failCount = 0;
  results.forEach(r => {
    if (r.status === 'PASS') passCount++;
    else failCount++;
  });
  console.log(`Total: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);

  await browser.close();
  return results;
}

audit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
