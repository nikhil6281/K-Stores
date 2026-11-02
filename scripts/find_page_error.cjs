const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();

  page.on('pageerror', err => {
    console.log('PAGE ERROR MESSAGE:', err.message);
    console.log('PAGE ERROR STACK:', err.stack);
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text(), msg.location());
    }
  });

  await page.goto('http://localhost:8080/K-Stores/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await browser.close();
}

test();
