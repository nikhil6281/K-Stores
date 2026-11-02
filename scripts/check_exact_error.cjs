const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();

  page.on('pageerror', err => {
    console.log('--- PAGE ERROR ---');
    console.log('Message:', err.message);
    console.log('Stack:', err.stack);
  });

  await page.goto('http://localhost:8080/K-Stores/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await browser.close();
}

check();
