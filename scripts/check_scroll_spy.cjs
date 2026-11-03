const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080/K-Stores/?cat=cat_1791796976112');
  await page.waitForTimeout(1000);

  const secInfo = await page.evaluate(() => {
    const sec = document.getElementById('cat-cat_1791796976112');
    const soapSec = document.getElementById('cat-cat_1792562770313');
    return {
      scrollY: window.pageYOffset,
      soapTop: soapSec?.getBoundingClientRect().top,
      edibleOilsTop: sec?.getBoundingClientRect().top,
      edibleOilsSecExists: !!sec
    };
  });
  console.log('Scroll & section info:', secInfo);

  await page.waitForTimeout(2000);
  const secInfo2 = await page.evaluate(() => {
    return {
      scrollY: window.pageYOffset,
      activeChip: document.querySelector('#categoryChipsBar .chip.active')?.getAttribute('data-cat')
    };
  });
  console.log('After scroll completed:', secInfo2);

  await browser.close();
})();

