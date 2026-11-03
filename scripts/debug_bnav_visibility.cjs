const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/K-Stores/');
  await page.waitForTimeout(2000);

  console.log('Before cart click:');
  const styleBefore = await page.evaluate(() => {
    const btn = document.getElementById('bnavCategoriesBtn');
    const nav = document.getElementById('mobileBottomNav');
    const csBtn = window.getComputedStyle(btn);
    const csNav = window.getComputedStyle(nav);
    return {
      navDisplay: csNav.display,
      navVisibility: csNav.visibility,
      navTransform: csNav.transform,
      navOpacity: csNav.opacity,
      btnDisplay: csBtn.display,
      btnVisibility: csBtn.visibility,
      bodyClasses: document.body.className
    };
  });
  console.log(styleBefore);

  await page.click('#bnavCartBtn');
  await page.waitForTimeout(500);

  console.log('After cart click:');
  const styleAfter = await page.evaluate(() => {
    const btn = document.getElementById('bnavCategoriesBtn');
    const nav = document.getElementById('mobileBottomNav');
    const csBtn = window.getComputedStyle(btn);
    const csNav = window.getComputedStyle(nav);
    return {
      navDisplay: csNav.display,
      navVisibility: csNav.visibility,
      navTransform: csNav.transform,
      navOpacity: csNav.opacity,
      btnDisplay: csBtn.display,
      btnVisibility: csBtn.visibility,
      bodyClasses: document.body.className
    };
  });
  console.log(styleAfter);

  await browser.close();
})();
