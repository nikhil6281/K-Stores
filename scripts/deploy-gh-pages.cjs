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

console.log('✅ Build output ready in dist/');

