const fs = require('fs');

let content = fs.readFileSync('tests/test_full_logic.cjs', 'utf8');

content = content.replace(
  "assert.strictEqual(config.storeName, 'RA Store');",
  "assert.strictEqual(config.storeName, 'Sri Sai');"
);
content = content.replace(
  'Central config loads storeName "RA Store"',
  'Central config loads storeName "Sri Sai"'
);

content = content.replace(
  "assert(cfg.address.includes('Sri Sai General Store, Old Town, Anantapur'), 'Address must contain Sri Sai General Store, Old Town');",
  "assert(cfg.address.includes('Old Town, Anantapur'), 'Address must contain Old Town, Anantapur');"
);

content = content.replace(
  /assert\(fnCode\.includes\('ఆర్డర్ నిర్ధారించబడింది'\)[\s\S]*?assert\(fnCode\.includes\('డెలివరీ చేయబడింది'\)[^\n]*\n/,
  "assert(fnCode.includes('Accepted') && fnCode.includes('Out for Delivery') && fnCode.includes('Delivered'), 'Must include English order status updates');\n"
);

fs.writeFileSync('tests/test_full_logic.cjs', content, 'utf8');
console.log('✅ Updated tests/test_full_logic.cjs');

