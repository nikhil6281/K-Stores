const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Verifying Account & Data Deletion Page & Integration...');

const root = path.resolve(__dirname, '..');
const rootFile = path.join(root, 'delete-account.html');
const publicFile = path.join(root, 'public', 'delete-account.html');
const distFile = path.join(root, 'dist', 'delete-account.html');

assert(fs.existsSync(rootFile), 'delete-account.html must exist in repository root');
assert(fs.existsSync(publicFile), 'public/delete-account.html must exist');
assert(fs.existsSync(distFile), 'dist/delete-account.html must exist after build');
console.log('✅ File existence in root, public/, and dist/ verified');

const content = fs.readFileSync(rootFile, 'utf8');

// Title & Meta
assert(content.includes('Account & Data Deletion — Sri Sai'), 'Title must be Account & Data Deletion — Sri Sai');
assert(content.includes('srisaistores.in/delete-account.html'), 'Canonical tag must point to https://srisaistores.in/delete-account.html');
assert(content.includes('79897 92937') || content.includes('7989792937'), 'Helpline must contain 79897 92937');
assert(content.includes('nickeygonu@gmail.com'), 'Email must contain nickeygonu@gmail.com');
assert(content.includes('515001'), 'Must mention Anantapur PIN 515001');

// Methods
assert(content.includes('Method 1') && content.includes('Delete Account & Data'), 'Must document Method 1: In-app deletion');
assert(content.includes('Method 2') && content.includes('deletionRequestForm'), 'Must provide Method 2: Online deletion request form');
assert(content.includes('7 business days') || content.includes('7 days'), 'Must specify 7-day deletion timeframe');
assert(content.includes('push notification') || content.includes('push tokens') || content.includes('FCM'), 'Must list push notification token deletion');
assert(content.includes('saved delivery addresses') || content.includes('Saved Addresses'), 'Must list saved delivery addresses deletion');
assert(content.includes('Tax') || content.includes('tax') || content.includes('GST'), 'Must explain statutory tax/accounting retention');

// Index.html checks
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(indexHtml.includes('href="./delete-account.html"'), 'index.html must link to delete-account.html');
assert(indexHtml.includes('btnDeleteAccount'), 'index.html must contain btnDeleteAccount');
assert(indexHtml.includes('tDeleteAccountLink'), 'index.html must contain tDeleteAccountLink');

// Other policy pages
const policies = ['privacy-policy.html', 'terms.html', 'about-us.html', 'contact-us.html', 'refund-policy.html', 'shipping-policy.html'];
for (const p of policies) {
  const pPath = path.join(root, p);
  const pContent = fs.readFileSync(pPath, 'utf8');
  assert(pContent.includes('delete-account.html'), `${p} must include link to delete-account.html in footer-nav`);
}
console.log('✅ All policy navigation links to delete-account.html verified');

console.log('🎉 All Account & Data Deletion tests PASSED successfully!');
