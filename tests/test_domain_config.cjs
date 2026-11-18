const fs = require('fs');
const assert = require('assert');

console.log('🧪 Verifying Custom Domain Configuration (srisaistores.in)...');

// 1. Root CNAME
assert(fs.existsSync('CNAME'), 'Root CNAME file must exist');
const cname = fs.readFileSync('CNAME', 'utf8').trim();
assert.strictEqual(cname, 'srisaistores.in', 'CNAME must be srisaistores.in');

// 2. Public CNAME
assert(fs.existsSync('public/CNAME'), 'public/CNAME file must exist');
const pubCname = fs.readFileSync('public/CNAME', 'utf8').trim();
assert.strictEqual(pubCname, 'srisaistores.in', 'public/CNAME must be srisaistores.in');

// 3. index.html canonical & og:url
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(indexHtml.includes('<link rel="canonical" href="https://srisaistores.in/">'), 'Canonical URL must point to https://srisaistores.in/');
assert(indexHtml.includes('<meta property="og:url" content="https://srisaistores.in/">'), 'og:url must point to https://srisaistores.in/');
assert(!indexHtml.includes('https://nikhil6281.github.io/K-Stores/'), 'Old domain URL must not be present in index.html meta/canonical');

// 4. Manifest JSON
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
assert.strictEqual(manifest.id, './', 'manifest.id must be ./ for root domain compatibility');
assert.strictEqual(manifest.start_url, './', 'manifest.start_url must be ./');
assert.strictEqual(manifest.scope, './', 'manifest.scope must be ./');

const pubManifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
assert.strictEqual(pubManifest.id, './', 'public/manifest.id must be ./');

// 5. Sitemap XML
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
assert(sitemap.includes('https://srisaistores.in/'), 'sitemap.xml must contain https://srisaistores.in/');
assert(!sitemap.includes('nikhil6281.github.io'), 'sitemap.xml must not contain nikhil6281.github.io');

const pubSitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
assert(pubSitemap.includes('https://srisaistores.in/'), 'public/sitemap.xml must contain https://srisaistores.in/');

// 6. Cloudflare Worker wrangler.toml
const wranglerToml = fs.readFileSync('worker/wrangler.toml', 'utf8');
assert(wranglerToml.includes('FRONTEND_URL = "https://srisaistores.in"'), 'wrangler.toml must configure FRONTEND_URL');
assert(wranglerToml.includes('https://srisaistores.in'), 'wrangler.toml must allow srisaistores.in');
assert(wranglerToml.includes('https://www.srisaistores.in'), 'wrangler.toml must allow www.srisaistores.in');
assert(wranglerToml.includes('https://nikhil6281.github.io'), 'wrangler.toml must preserve nikhil6281.github.io');

// 7. Cloudflare Worker source index.js
const workerJs = fs.readFileSync('worker/src/index.js', 'utf8');
assert(workerJs.includes("'https://srisaistores.in'"), 'worker/src/index.js must include https://srisaistores.in');
assert(workerJs.includes("'https://www.srisaistores.in'"), 'worker/src/index.js must include https://www.srisaistores.in');
assert(workerJs.includes("'https://nikhil6281.github.io'"), 'worker/src/index.js must include https://nikhil6281.github.io');
assert(workerJs.includes("'capacitor://localhost'"), 'worker/src/index.js must include capacitor://localhost');
assert(workerJs.includes("'http://localhost'"), 'worker/src/index.js must include http://localhost');

// 8. deploy-gh-pages.cjs
const deployScript = fs.readFileSync('scripts/deploy-gh-pages.cjs', 'utf8');
assert(deployScript.includes('CNAME'), 'deploy-gh-pages.cjs must copy CNAME to dist');

console.log('✅ ALL CUSTOM DOMAIN CONFIGURATION CHECKS PASSED!');
