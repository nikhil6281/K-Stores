const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080/K-Stores/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Add item to cart
  await page.click('.action-add-cart');
  await page.waitForTimeout(300);

  // Simulate authenticated user and open checkout modal
  const result = await page.evaluate(async () => {
    window.currentUser = { uid: 'test_user_123', phoneNumber: '+919876543210' };
    openCheckout();
    document.getElementById('custName').value = 'Ramesh Kumar';
    document.getElementById('custPhone').value = '9876543210';
    document.getElementById('custAddress').value = 'Flat 402, Jubilee Hills, Hyderabad 500081';
    
    // Trigger submit
    const submitEvent = new Event('submit', { cancelable: true });
    document.getElementById('checkoutForm').dispatchEvent(submitEvent);
    
    const notice = document.getElementById('checkoutNoticeMsg');
    return {
      displayed: notice.style.display !== 'none',
      text: notice.innerText
    };
  });

  console.log('PIN validation test result:', result);
  await browser.close();
})();
