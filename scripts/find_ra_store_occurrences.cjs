const fs = require('fs');
const path = require('path');

const targetFiles = [
  'config.js',
  'public/config.js',
  'manifest.json',
  'public/manifest.json',
  'index.html',
  'admin.html',
  'worker.html',
  'about-us.html',
  'contact-us.html',
  'terms.html',
  'privacy-policy.html',
  'refund-policy.html',
  'shipping-policy.html',
  'offline.html',
  '404.html',
  'sw.js',
  'public/sw.js',
  'functions/index.js',
  'worker/src/index.js'
];

targetFiles.forEach(relPath => {
  if (!fs.existsSync(relPath)) return;
  const content = fs.readFileSync(relPath, 'utf8');
  const matches = content.match(/RA\s*Store|RA\s*STAFF|RA_STORE|RA-STAFF/gi) || [];
  console.log(`${relPath}: ${matches.length} matches`);
});

