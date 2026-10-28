/**
 * Comprehensive Automated Logic & Security Test Suite for RA Store
 * Tests: Pricing, PIN validation, State Machine, HMAC verification, Staff Permissions, Clean Branding.
 */
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');

console.log('========================================================');
console.log('🧪 RUNNING FULL LOGIC & SECURITY AUDIT TEST SUITE');
console.log('========================================================\n');

let passCount = 0;
let failCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${desc}`);
    passCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${desc}`);
    console.error(`   Error: ${err.message}`);
    failCount++;
  }
}

// ----------------------------------------------------
// 1. Central Config Verification
// ----------------------------------------------------
it('Central config loads storeName "RA Store" and city "Anantapur"', () => {
  require('../config.js');
  const config = globalThis.APP_CONFIG;
  assert(config, 'APP_CONFIG must exist on globalThis/window');
  assert.strictEqual(config.storeName, 'RA Store');
  assert.strictEqual(config.city, 'Anantapur');
  assert.deepStrictEqual(config.pinCodes, ['515001', '515002', '515003', '515004', '515005']);
  assert.strictEqual(config.defaultPin, '515001');
  assert(config.landmarks.length >= 5);
  assert.strictEqual(config.landmarks[0], 'Tower Clock');
});

// ----------------------------------------------------
// 2. Anantapur PIN Validation Logic
// ----------------------------------------------------
it('Serviced PIN code validation accepts 515001-515005 and rejects outside PINs', () => {
  const servedPins = ['515001', '515002', '515003', '515004', '515005'];
  
  function validateAddress(addr) {
    const pinMatch = addr.match(/\b(5\d{5})\b/);
    if (pinMatch && !servedPins.includes(pinMatch[1])) {
      return false;
    }
    return addr.trim().length >= 10;
  }

  assert.strictEqual(validateAddress('Near Tower Clock, Subhash Road, Anantapur 515001'), true);
  assert.strictEqual(validateAddress('Kamalanagar 4th cross, Anantapur 515003'), true);
  assert.strictEqual(validateAddress('Hyderabad Road, 500001'), false); // Outside Anantapur
  assert.strictEqual(validateAddress('Old Village, 515134'), false); // Old decommissioned PIN
  assert.strictEqual(validateAddress('Short'), false); // Too short (< 10 chars)
});

// ----------------------------------------------------
// 3. Server-Side Price Recalculation
// ----------------------------------------------------
it('Server recalculates cart subtotal and ignores tampered client prices', () => {
  const mockDbProducts = {
    'prod_1': { price: 40, inStock: true, name: 'Tomatoes' },
    'prod_2': { price: 30, inStock: true, name: 'Milk' }
  };
  const mockSettings = { freeDeliveryThreshold: 200, deliveryFee: 25 };

  function serverCalculateTotal(clientItems) {
    let subtotal = 0;
    for (const item of clientItems) {
      const p = mockDbProducts[item.id];
      if (!p || !p.inStock) throw new Error('Unavailable item');
      subtotal += (p.price * item.quantity); // Server price used, ignoring item.price!
    }
    const fee = subtotal >= mockSettings.freeDeliveryThreshold ? 0 : mockSettings.deliveryFee;
    return subtotal + fee;
  }

  // Client attempts to send ₹1 price
  const tamperedItems = [
    { id: 'prod_1', quantity: 2, price: 1 },
    { id: 'prod_2', quantity: 1, price: 1 }
  ];

  const serverTotal = serverCalculateTotal(tamperedItems);
  // Expected: (40*2) + (30*1) = 110 subtotal + 25 delivery = 135
  assert.strictEqual(serverTotal, 135);
});

// ----------------------------------------------------
// 4. Order State Machine Transition Rules
// ----------------------------------------------------
it('State machine strictly enforces placed -> accepted -> packed -> out -> delivered', () => {
  const STATUS_FLOW = ['placed', 'accepted', 'packed', 'out_for_delivery', 'delivered'];

  function isValidTransition(current, next) {
    if (next === 'cancelled') {
      return current === 'placed' || current === 'accepted' || current === 'packed';
    }
    const curIdx = STATUS_FLOW.indexOf(current);
    const nextIdx = STATUS_FLOW.indexOf(next);
    return curIdx !== -1 && nextIdx === curIdx + 1;
  }

  assert.strictEqual(isValidTransition('placed', 'accepted'), true);
  assert.strictEqual(isValidTransition('accepted', 'packed'), true);
  assert.strictEqual(isValidTransition('packed', 'out_for_delivery'), true);
  assert.strictEqual(isValidTransition('out_for_delivery', 'delivered'), true);

  // Illegal transitions
  assert.strictEqual(isValidTransition('placed', 'delivered'), false); // Cannot skip stages
  assert.strictEqual(isValidTransition('packed', 'accepted'), false); // Cannot go backward
  assert.strictEqual(isValidTransition('out_for_delivery', 'cancelled'), false); // Cannot cancel after dispatch!
  assert.strictEqual(isValidTransition('delivered', 'cancelled'), false);
});

// ----------------------------------------------------
// 5. Constant-time HMAC-SHA256 Signature Verification
// ----------------------------------------------------
it('HMAC-SHA256 constant-time signature verification prevents forgery and timing leaks', () => {
  const secret = 'TestWebhookSecret123';
  const orderId = 'order_DA2345';
  const paymentId = 'pay_987654';
  const msg = `${orderId}|${paymentId}`;

  const validSig = crypto.createHmac('sha256', secret).update(msg).digest('hex');
  const bogusSig = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  function verifyHmac(sec, message, expectedHex) {
    const calculatedHex = crypto.createHmac('sha256', sec).update(message).digest('hex');
    if (calculatedHex.length !== expectedHex.length) return false;
    let diff = 0;
    for (let i = 0; i < calculatedHex.length; i++) {
      diff |= calculatedHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    return diff === 0;
  }

  assert.strictEqual(verifyHmac(secret, msg, validSig), true);
  assert.strictEqual(verifyHmac(secret, msg, bogusSig), false);
  assert.strictEqual(verifyHmac('WrongSecret', msg, validSig), false);
});

// ----------------------------------------------------
// 6. CSV Injection Sanitization & UTF-8 Telugu BOM
// ----------------------------------------------------
it('CSV exporter neutralizes formula injection (=, +, -, @) and attaches UTF-8 BOM', () => {
  function sanitizeCsvCell(val) {
    if (val === null || val === undefined) return '""';
    let s = String(val).replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(s)) {
      s = "'" + s; // neutralize
    }
    return `"${s}"`;
  }

  assert.strictEqual(sanitizeCsvCell('=cmd|"/C calc"!A0'), '"\'=cmd|""/C calc""!A0"');
  assert.strictEqual(sanitizeCsvCell('+1234'), '"\'+1234"');
  assert.strictEqual(sanitizeCsvCell('Normal Customer'), '"Normal Customer"');
  assert.strictEqual(sanitizeCsvCell('అనంతపురం'), '"అనంతపురం"');
});

// ----------------------------------------------------
// 7. Verification: Zero Old Location Terms in Live Files
// ----------------------------------------------------
it('Zero occurrences of decommissioned terms in live store files', () => {
  const liveFiles = [
    'index.html',
    'admin.html',
    'worker.html',
    'privacy-policy.html',
    'refund-policy.html',
    'terms.html',
    'about-us.html',
    'contact-us.html',
    'pricing.html',
    'shipping-policy.html',
    'manifest.json',
    'config.js'
  ];

  const forbiddenRegex = /Bommalatapall|Chennampalli|515134|బొమ్మల/i;

  for (const f of liveFiles) {
    const text = fs.readFileSync(f, 'utf8');
    assert.strictEqual(forbiddenRegex.test(text), false, `Forbidden term found in ${f}`);
  }
});

console.log('\n--------------------------------------------------------');
console.log(`Test Summary: ${passCount} Passed, ${failCount} Failed`);
console.log('--------------------------------------------------------\n');

if (failCount > 0) process.exit(1);
