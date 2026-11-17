const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Mobile-first style tag exists
assert(html.includes('id="mobileFirstLayoutStyles"'), 'mobileFirstLayoutStyles must exist');

// 2. Media queries exist
assert(html.includes('@media (min-width: 481px) and (max-width: 767px)'), 'Mobile-first tablet mini query must exist');
assert(html.includes('@media (min-width: 768px)'), '768px tablet query must exist');
assert(html.includes('@media (min-width: 1024px)'), '1024px laptop query must exist');
assert(html.includes('@media (min-width: 1360px)'), '1360px wide desktop query must exist');

// 3. Desktop container max-width 1240px
assert(html.includes('max-width: 1240px'), 'Desktop container must use 1240px');

// 4. Multi-column grid definition
assert(html.includes('repeat(3, minmax(0, 1fr))'), '3-column grid for tablets must exist');
assert(html.includes('repeat(4, minmax(0, 1fr))'), '4-column grid for laptops must exist');
assert(html.includes('repeat(5, minmax(0, 1fr))'), '5-column grid for wide screens must exist');

// 5. Product card height & image sizing
assert(html.includes('height: 150px !important'), '150px product image height must exist');
assert(html.includes('justify-content: space-between'), 'Product card space-between must exist');

// 6. Centered desktop modal dialogs
assert(html.includes('transform: translate(-50%, -50%) !important'), 'Modal dialog centering transform must exist');
assert(html.includes('max-width: 480px !important'), 'Desktop modal max-width 480px must exist');

// 7. Compact floating cart pill
assert(html.includes('max-width: 460px !important'), 'Floating cart pill max-width 460px must exist');

// 8. Desktop header cart & orders buttons
assert(html.includes('id="cartNavBtn"'), 'cartNavBtn must exist in navbar');
assert(html.includes('id="ordersNavBtn"'), 'ordersNavBtn must exist in navbar');

console.log('✅ ALL DESKTOP RESPONSIVE LAYOUT VERIFICATIONS PASSED!');
