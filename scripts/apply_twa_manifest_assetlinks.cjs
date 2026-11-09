const fs = require('fs');
const path = require('path');

// 1. Update manifest.json and public/manifest.json with complete icon purpose pairs
['manifest.json', 'public/manifest.json'].forEach(mfPath => {
  if (fs.existsSync(mfPath)) {
    const manifest = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
    manifest.icons = [
      {
        "src": "./icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "./icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": "./icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "./icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      }
    ];
    fs.writeFileSync(mfPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(`Updated ${mfPath} with 192 & 512 any/maskable icons.`);
  }
});

// 2. Create .well-known/assetlinks.json in root and in public/
const assetlinksContent = JSON.stringify([
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "in.rastore.app",
      "sha256_cert_fingerprints": [
        "14:6D:E9:7F:0E:52:91:7E:EA:5D:86:14:4E:00:A6:6E:A5:C0:C2:CE:2B:9E:09:1A:87:49:96:DF:3F:8B:02:CE"
      ]
    }
  }
], null, 2) + '\n';

['.well-known', 'public/.well-known'].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'assetlinks.json'), assetlinksContent, 'utf8');
  console.log(`Created ${path.join(dir, 'assetlinks.json')}`);
});

// 3. Ensure .nojekyll in root and public
if (!fs.existsSync('.nojekyll')) {
  fs.writeFileSync('.nojekyll', '', 'utf8');
}
fs.writeFileSync('public/.nojekyll', '', 'utf8');
console.log('Ensured .nojekyll in root and public/');

// 4. Update scripts/deploy-gh-pages.cjs so dist always gets .well-known and .nojekyll
const deployScriptPath = 'scripts/deploy-gh-pages.cjs';
if (fs.existsSync(deployScriptPath)) {
  let deployCode = fs.readFileSync(deployScriptPath, 'utf8');
  if (!deployCode.includes('assetlinks.json')) {
    const injectTarget = "console.log('✅ 404.html copied to dist');\n}";
    const injectCode = `console.log('✅ 404.html copied to dist');
}

// 4. Ensure .well-known/assetlinks.json exists in dist
const distWellKnown = path.join(distPath, '.well-known');
if (!fs.existsSync(distWellKnown)) fs.mkdirSync(distWellKnown, { recursive: true });
const rootAssetlinks = path.resolve(__dirname, '..', '.well-known', 'assetlinks.json');
if (fs.existsSync(rootAssetlinks)) {
  fs.copyFileSync(rootAssetlinks, path.join(distWellKnown, 'assetlinks.json'));
  console.log('✅ .well-known/assetlinks.json copied to dist');
}`;
    deployCode = deployCode.replace(injectTarget, injectCode);
    fs.writeFileSync(deployScriptPath, deployCode, 'utf8');
    console.log('Updated scripts/deploy-gh-pages.cjs to deploy assetlinks.json to dist.');
  }
}

