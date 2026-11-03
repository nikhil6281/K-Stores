const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/K-Stores/');
  await page.waitForTimeout(2000);

  // 1. Go to Account view
  await page.click('#bnavAccountBtn');
  await page.waitForTimeout(400);

  // 2. Open loginModal from Account
  await page.click('#accountSignInBtn');
  await page.waitForTimeout(400);

  const beforeBack = await page.evaluate(() => {
    return {
      loginModalDisplay: document.getElementById('loginModal').style.display,
      accountViewDisplay: document.getElementById('accountView').style.display,
      homeViewDisplay: document.getElementById('homeView').style.display
    };
  });
  console.log('Before Back:', beforeBack);

  // 3. Press Android Back (history.back)
  await page.goBack();
  await page.waitForTimeout(400);

  const afterBack = await page.evaluate(() => {
    return {
      loginModalDisplay: document.getElementById('loginModal').style.display,
      accountViewDisplay: document.getElementById('accountView').style.display,
      homeViewDisplay: document.getElementById('homeView').style.display
    };
  });
  console.log('After Back:', afterBack);

  await browser.close();
})();

