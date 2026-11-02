const fs = require('fs');
const path = require('path');

const testPath = path.join(__dirname, '..', 'tests', 'test_full_logic.cjs');
let content = fs.readFileSync(testPath, 'utf8');

const newTests = `
// ==========================================
// STEP 1, 2, 3: UI REFINEMENTS & NOTIFICATIONS AUDIT TESTS
// ==========================================

it('S1.1: Order list sorting & grouping in index.html (newest first by createdAt)', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert(html.includes('orderEntries.sort((a, b) =>'), 'Orders must be sorted by createdAt');
  assert(html.includes('liveEntries.push(entry)'), 'Live orders must be partitioned and rendered');
  assert(html.includes('pastEntries.push(entry)'), 'Past orders must be partitioned and rendered');
  assert(html.includes('localStorage.setItem(\\'ra_last_order\\','), 'Latest order must update for Reorder Last');
});

it('S1.2: Removal of floating #unifiedHelpFab from markup, CSS, and JS', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert(!html.includes('id="unifiedHelpFab"'), 'unifiedHelpFab markup must be completely removed');
  assert(!html.includes('id=\\'unifiedHelpFab\\''), 'unifiedHelpFab must not exist');
  assert(!html.includes('helpFabTrigger'), 'helpFabTrigger must be removed');
  // Confirm Account Help & Support and footer helpline are still kept
  assert(html.includes('accountWhatsappLink'), 'Account WhatsApp link must be kept');
  assert(html.includes('accountCallStoreLink'), 'Account Call store link must be kept');
});

it('S1.3: Five tabs in bottom navigation with Categories grid icon and smooth scroll', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert(html.includes('id="bnavCategoriesBtn"'), 'Bottom navigation must include Categories button');
  assert(html.includes('data-tab="categories"'), 'Categories button must have data-tab=categories');
  assert(html.includes('tBnavCategories'), 'Categories label must exist for i18n translation');
  assert(html.includes('scrollToCategorySection') || html.includes('categoryChipsBar'), 'Categories tab must scroll to category section');
  assert(html.includes('min-width: 0'), 'bottom-nav-item must have min-width: 0 for 360px phones');
});

it('S2.1: Service worker & fallback support FCM web push with order tagging', () => {
  const swCode = fs.readFileSync('sw.js', 'utf8');
  assert(swCode.includes('ra-order-'), 'sw.js must tag notifications with orderId for replacement');
  assert(swCode.includes('renotify: true'), 'sw.js must renotify on status updates');
  assert(fs.existsSync('firebase-messaging-sw.js'), 'firebase-messaging-sw.js must exist in root');
  assert(fs.existsSync('public/firebase-messaging-sw.js'), 'public/firebase-messaging-sw.js must exist');
});

it('S2.2: Privacy Policy contains push notification and account opt-out notice', () => {
  const pp = fs.readFileSync('privacy-policy.html', 'utf8');
  assert(pp.toLowerCase().includes('push notification'), 'Privacy policy must mention push notifications');
  assert(pp.includes('Account'), 'Privacy policy must mention opt-out in Account');
});

it('S2.3: Cloud Functions backend implements order status updates with bilingual Telugu/English', () => {
  assert(fs.existsSync('functions/index.js'), 'functions/index.js must exist');
  const fnCode = fs.readFileSync('functions/index.js', 'utf8');
  assert(fnCode.includes('onOrderStatusChanged'), 'Must implement onOrderStatusChanged database trigger');
  assert(fnCode.includes('ఆర్డర్ నిర్ధారించబడింది'), 'Must include natural Telugu for Accepted');
  assert(fnCode.includes('డెలివరీ బయలుదేరింది'), 'Must include natural Telugu for Out for Delivery');
  assert(fnCode.includes('డెలివరీ చేయబడింది'), 'Must include natural Telugu for Delivered');
  assert(!fnCode.includes('o.code') && !fnCode.includes('o.customer.phone'), 'Must NEVER put OTP code or phone in notifications');
});

it('S3.1: Anti-annoyance rules engine strictly enforced', () => {
  const fnCode = fs.readFileSync('functions/index.js', 'utf8');
  assert(fnCode.includes('istHour < 8 || istHour >= 20'), 'Must enforce 8:00 AM - 8:00 PM IST');
  assert(fnCode.includes('offersLastDay >= 1'), 'Must enforce max 1 offer per day');
  assert(fnCode.includes('offersLastWeek >= 3'), 'Must enforce max 3 offers per week');
  assert(fnCode.includes('hasActiveOrder'), 'Must block offers during active orders');
  assert(fnCode.includes('twentyFourHoursAgo'), 'Must block offers within 24h after delivery');
  assert(fnCode.includes('consecutiveUnopened >= 4'), 'Must pause offers after 4 unopened for 30 days');
});

it('S3.2: Admin portal contains Notifications card with master switch and audience targeting', () => {
  const adminHtml = fs.readFileSync('admin.html', 'utf8');
  assert(adminHtml.includes('id="settingAutoOffersEnabled"'), 'Must have master switch for automatic offers');
  assert(adminHtml.includes('id="offerAudienceSelect"'), 'Must have target audience selector');
  assert(adminHtml.includes('id="btnSendBroadcastOffer"'), 'Must have Send Offer broadcast button');
});
`;

const marker = "console.log('\\n--------------------------------------------------------');";
if (!content.includes('S1.1: Order list sorting')) {
  content = content.replace(marker, newTests + '\n' + marker);
  fs.writeFileSync(testPath, content, 'utf8');
  console.log('✅ Appended S1, S2, S3 tests to test_full_logic.cjs');
}
