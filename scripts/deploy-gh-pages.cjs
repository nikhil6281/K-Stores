const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running deploy-gh-pages...');

// 1. Verify dist folder exists
const distPath = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist folder does not exist. Run "npm run build" first.');
  process.exit(1);
}

// 2. Ensure .nojekyll exists in dist
fs.writeFileSync(path.join(distPath, '.nojekyll'), '');
console.log('✅ .nojekyll ensured in dist');

// 3. Ensure 404.html exists in dist
const root404 = path.resolve(__dirname, '..', '404.html');
if (fs.existsSync(root404)) {
  fs.copyFileSync(root404, path.join(distPath, '404.html'));
  console.log('✅ 404.html copied to dist');
}

// 4. Ensure .well-known/assetlinks.json exists in dist
const assetlinksSrc = path.resolve(__dirname, '..', '.well-known', 'assetlinks.json');
const assetlinksDestDir = path.join(distPath, '.well-known');
if (fs.existsSync(assetlinksSrc)) {
  if (!fs.existsSync(assetlinksDestDir)) {
    fs.mkdirSync(assetlinksDestDir, { recursive: true });
  }
  fs.copyFileSync(assetlinksSrc, path.join(assetlinksDestDir, 'assetlinks.json'));
  console.log('✅ .well-known/assetlinks.json copied to dist');
}

// 5. Ensure manifest.json and logo assets are available at both root and relative paths
const manifestSrc = path.resolve(__dirname, '..', 'public', 'manifest.json');
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, path.join(distPath, 'manifest.json'));
  console.log('✅ manifest.json ensured in dist root');
}

const logoSrcDir = path.resolve(__dirname, '..', 'public', 'assets', 'logo');
const logoDestDir = path.join(distPath, 'assets', 'logo');
if (fs.existsSync(logoSrcDir)) {
  if (!fs.existsSync(logoDestDir)) {
    fs.mkdirSync(logoDestDir, { recursive: true });
  }
  const logoFiles = fs.readdirSync(logoSrcDir);
  for (const file of logoFiles) {
    fs.copyFileSync(path.join(logoSrcDir, file), path.join(logoDestDir, file));
  }
  // Also copy main brand logo to dist/assets and dist/ for direct asset resolution
  const sriSaiLogo = path.join(logoSrcDir, 'sri-sai-logo.png');
  if (fs.existsSync(sriSaiLogo)) {
    fs.copyFileSync(sriSaiLogo, path.join(distPath, 'assets', 'sri-sai-logo.png'));
    fs.copyFileSync(sriSaiLogo, path.join(distPath, 'sri-sai-logo.png'));
  }
  console.log('✅ Brand logos ensured in dist/assets/logo');
}

console.log('✅ Build output ready in dist/');
