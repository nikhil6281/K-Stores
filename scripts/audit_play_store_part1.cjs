const fs = require('fs');
const path = require('path');

// 1. Audit Manifest files
console.log('=== 1. MANIFEST AUDIT ===');
['manifest.json', 'public/manifest.json', 'public/assets/manifest.json'].forEach(mf => {
  if (fs.existsSync(mf)) {
    console.log(`Found ${mf}:`);
    try {
      const data = JSON.parse(fs.readFileSync(mf, 'utf8'));
      console.log(`- id: ${data.id}`);
      console.log(`- name: ${data.name}`);
      console.log(`- short_name: ${data.short_name}`);
      console.log(`- start_url: ${data.start_url}`);
      console.log(`- scope: ${data.scope}`);
      console.log(`- display: ${data.display}`);
      console.log(`- orientation: ${data.orientation}`);
      console.log(`- theme_color: ${data.theme_color}`);
      console.log(`- background_color: ${data.background_color}`);
      console.log(`- icons count: ${data.icons?.length}`);
      data.icons?.forEach((ic, idx) => {
        console.log(`  [icon ${idx}] src=${ic.src}, sizes=${ic.sizes}, type=${ic.type}, purpose=${ic.purpose}`);
      });
    } catch (e) {
      console.error(`Error parsing ${mf}:`, e.message);
    }
  } else {
    console.log(`Not found: ${mf}`);
  }
});

// 2. Check .nojekyll and .well-known/assetlinks.json
console.log('\n=== 2. NOJEKYLL & ASSETLINKS AUDIT ===');
console.log(`.nojekyll in root: ${fs.existsSync('.nojekyll')}`);
console.log(`.nojekyll in public: ${fs.existsSync('public/.nojekyll')}`);
console.log(`.nojekyll in dist: ${fs.existsSync('dist/.nojekyll')}`);
console.log(`.well-known/assetlinks.json in root: ${fs.existsSync('.well-known/assetlinks.json')}`);
console.log(`.well-known/assetlinks.json in public: ${fs.existsSync('public/.well-known/assetlinks.json')}`);
if (fs.existsSync('.well-known/assetlinks.json')) {
  console.log('Root assetlinks:', fs.readFileSync('.well-known/assetlinks.json', 'utf8').slice(0, 300));
}
if (fs.existsSync('public/.well-known/assetlinks.json')) {
  console.log('Public assetlinks:', fs.readFileSync('public/.well-known/assetlinks.json', 'utf8').slice(0, 300));
}

