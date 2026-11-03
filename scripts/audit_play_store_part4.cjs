const fs = require('fs');

console.log('=== 4. POLICY PAGES & ACCOUNT DELETION AUDIT ===');
const policies = [
  'privacy-policy.html',
  'terms.html',
  'refund-policy.html',
  'shipping-policy.html',
  'contact-us.html',
  'about-us.html'
];

policies.forEach(p => {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    const hasBackLink = content.includes('href="./"') || content.includes('href="index.html"') || content.includes('href="./index.html"') || content.includes('href="/K-Stores/"');
    const backBtnText = content.match(/<a[^>]*class=["'][^"']*back[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
    console.log(`[FILE] ${p}: Exists (${content.length} bytes), Has back link: ${hasBackLink}`);
  } else {
    console.log(`[FILE] ${p}: MISSING!`);
  }
});

// Check policy links inside index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
console.log('\n--- Policy Links in index.html ---');
policies.forEach(p => {
  const present = indexHtml.includes(p);
  console.log(`- ${p} linked in index.html: ${present}`);
});

// Check Delete Account in index.html
console.log('\n--- Account Deletion in index.html ---');
console.log('Has #btnDeleteAccount in markup:', indexHtml.includes('id="btnDeleteAccount"'));
const delSection = indexHtml.match(/btnDeleteAccount[\s\S]{0,1000}/);
if (delSection) {
  console.log('Snippet around btnDeleteAccount:', delSection[0].slice(0, 400));
}

