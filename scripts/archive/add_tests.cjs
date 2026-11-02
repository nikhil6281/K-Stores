const fs = require('fs');
const path = require('path');

const testPath = path.join(__dirname, '..', 'tests', 'test_full_logic.cjs');
let c = fs.readFileSync(testPath, 'utf8');

const newTests = `
it('S2.4: Client-side FCM token registration, VAPID key in config, and token teardown on logout', () => {
  const cfg = fs.readFileSync('config.js', 'utf8');
  assert(cfg.includes('fcmVapidKey: "BA8LXygemNcWjiGlSvjbVigw72mi4EgEdHYE-h-5UaPO8X4lL4AwSgr2Zk_mSrUEsbsRpCF_B7F-NfHP4kFaRYY"'), 'config.js must contain user fcmVapidKey');
  const html = fs.readFileSync('index.html', 'utf8');
  assert(html.includes('registerFcmToken'), 'index.html must implement registerFcmToken');
  assert(html.includes('removeCurrentDeviceToken'), 'index.html must implement removeCurrentDeviceToken');
  assert(html.includes('fcmMessaging.getToken'), 'index.html must call fcmMessaging.getToken');
  assert(html.includes('accountLogoutBtn'), 'index.html must teardown token on logout');
});

it('S3.3: Cloudflare Worker routes and bilingual status notification pipeline for Spark plan', () => {
  const workerCode = fs.readFileSync('worker/src/index.js', 'utf8');
  assert(workerCode.includes('/api/notify-order-status'), 'worker must mount /api/notify-order-status route');
  assert(workerCode.includes('sendOrderStatusNotification'), 'worker must implement sendOrderStatusNotification');
  assert(workerCode.includes('ఆర్డర్ నిర్ధారించబడింది'), 'worker must support Telugu order notifications');
  assert(workerCode.includes('/api/admin/send-offer'), 'worker must mount /api/admin/send-offer route');
  assert(workerCode.includes('/api/verify-delivery-otp'), 'worker must mount /api/verify-delivery-otp route');
});
`;

if (!c.includes('S2.4: Client-side FCM token registration')) {
  c = c.replace(/console\.log\(\s*['"]\\n--------------------------------------------------------['"]\s*\);/, newTests + "\nconsole.log('\\n--------------------------------------------------------');");
  fs.writeFileSync(testPath, c, 'utf8');
  console.log('✅ Added S2.4 and S3.3 tests to test_full_logic.cjs');
} else {
  console.log('Already present');
}
