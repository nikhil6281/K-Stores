const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:8080/K-Stores/?cat=cat_1791796976112');
  await page.waitForTimeout(3000);

  const res = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('#categoryChipsBar .chip'));
    const activeChip = document.querySelector('#categoryChipsBar .chip.active');
    return {
      totalChips: chips.length,
      activeCat: activeChip?.getAttribute('data-cat'),
      activeText: activeChip?.innerText,
      currentCategory: window.currentCategory
    };
  });
  console.log('Result for ?cat=cat_1791796976112:', res);

  await browser.close();
})();

