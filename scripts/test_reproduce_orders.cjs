const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: 'block'
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:8080/K-Stores/ ...');
  await page.goto('http://localhost:8080/K-Stores/');
  await page.waitForTimeout(1500);

  // Click on Orders tab in bottom nav
  console.log('Clicking on bnavOrdersBtn...');
  await page.click('#bnavOrdersBtn');
  await page.waitForTimeout(2000);

  const state = await page.evaluate(() => {
    const ordersModal = document.getElementById('ordersModal');
    const customerOrdersList = document.getElementById('customerOrdersList');
    const loginModal = document.getElementById('loginModal');
    return {
      ordersModalDisplay: ordersModal ? ordersModal.style.display : null,
      customerOrdersListText: customerOrdersList ? customerOrdersList.innerText : null,
      loginModalDisplay: loginModal ? loginModal.style.display : null,
      currentNavTab: window.currentNavTab || null
    };
  });

  console.log('State after clicking bnavOrdersBtn when signed out:', state);

  // Now simulate signed in user:
  console.log('Simulating a signed in user calling openOrdersModal()...');
  const simState = await page.evaluate(() => {
    // Set a dummy user if not signed in to test openOrdersModal
    window.currentUser = { uid: 'test_user_123', email: 'test@example.com' };
    window.openOrdersModal();
    const ordersModal = document.getElementById('ordersModal');
    const customerOrdersList = document.getElementById('customerOrdersList');
    return {
      ordersModalDisplay: ordersModal ? ordersModal.style.display : null,
      customerOrdersListHtml: customerOrdersList ? customerOrdersList.innerHTML : null
    };
  });
  console.log('State right after openOrdersModal():', simState);

  // Wait 3 seconds to see if it changes
  await page.waitForTimeout(3000);
  const afterWait = await page.evaluate(() => {
    return document.getElementById('customerOrdersList')?.innerHTML;
  });
  console.log('customerOrdersList after 3s wait:', afterWait);

  await browser.close();
})();

