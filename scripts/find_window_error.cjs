const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();

  await page.addInitScript(() => {
    window.addEventListener('error', (e) => {
      console.log('WINDOW ERROR CAPTURED:', e.message, 'source:', e.filename, 'line:', e.lineno, 'col:', e.colno);
    });
  });

  page.on('console', msg => {
    console.log('[BROWSER CONSOLE]', msg.text());
  });

  await page.goto('http://localhost:8080/K-Stores/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await browser.close();
}

check();

