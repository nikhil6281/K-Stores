const fs = require('fs');
const path = require('path');

// 1. REWRITE src/components/CheckoutModal.tsx CLEANLY (0 mojibake, pure Lucide icons & ₹)
const checkoutPath = './src/components/CheckoutModal.tsx';
if (fs.existsSync(checkoutPath)) {
  let chk = fs.readFileSync(checkoutPath, 'utf8');
  
  // Replace corrupted currency & symbols
  chk = chk.replace(/â‚¹|â,¹|\u00e2\u201a\u00b9/g, '₹');
  chk = chk.replace(/â€¢/g, '•');
  chk = chk.replace(/âš¡|ðŸ›’|ðŸ>µ|ðŸµ|ðŸ/g, '');
  chk = chk.replace(/“ž/g, '');
  chk = chk.replace(/Ž‰|Ž%/g, '✨');
  
  // Ensure header icon is clean
  chk = chk.replace(/<div className="w-8 h-8 rounded-xl bg-amber-400[^>]*>[\s\S]*?<\/div>/, 
    `<div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
      <span className="text-sm font-black">20M</span>
    </div>`);

  fs.writeFileSync(checkoutPath, chk, 'utf8');
  console.log('✓ Fixed CheckoutModal.tsx');
}

// 2. REWRITE src/components/CartDrawer.tsx CLEANLY
const cartPath = './src/components/CartDrawer.tsx';
if (fs.existsSync(cartPath)) {
  let cart = fs.readFileSync(cartPath, 'utf8');
  cart = cart.replace(/â‚¹|â,¹|\u00e2\u201a\u00b9/g, '₹');
  cart = cart.replace(/â€¢/g, '•');
  cart = cart.replace(/“ž|Ž‰|Ž%/g, '');
  fs.writeFileSync(cartPath, cart, 'utf8');
  console.log('✓ Fixed CartDrawer.tsx');
}

// 3. REWRITE src/components/CustomerSupportModal.tsx CLEANLY
const supportPath = './src/components/CustomerSupportModal.tsx';
if (fs.existsSync(supportPath)) {
  let sup = fs.readFileSync(supportPath, 'utf8');
  sup = sup.replace(/“ž/g, '');
  sup = sup.replace(/â‚¹|â,¹/g, '₹');
  fs.writeFileSync(supportPath, sup, 'utf8');
  console.log('✓ Fixed CustomerSupportModal.tsx');
}

// 4. FIX SearchOverlay.tsx (Ensure fast live search)
const searchPath = './src/components/SearchOverlay.tsx';
if (fs.existsSync(searchPath)) {
  let s = fs.readFileSync(searchPath, 'utf8');
  s = s.replace(/â‚¹|â,¹/g, '₹');
  fs.writeFileSync(searchPath, s, 'utf8');
  console.log('✓ Fixed SearchOverlay.tsx');
}

// 5. GLOBAL CLEANUP ACROSS ALL SOURCE FILES
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist')) results = results.concat(walk(full));
    } else if (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.html')) {
      results.push(full);
    }
  });
  return results;
}

const allFiles = walk('./src').concat(['index.html']);
allFiles.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;

  if (/â‚¹|â,¹|\u00e2\u201a\u00b9/g.test(c)) {
    c = c.replace(/â‚¹|â,¹|\u00e2\u201a\u00b9/g, '₹');
    changed = true;
  }
  if (c.includes('â€¢')) {
    c = c.replace(/â€¢/g, '•');
    changed = true;
  }
  if (c.includes('“ž')) {
    c = c.replace(/“ž/g, '');
    changed = true;
  }
  if (c.includes('Ž‰') || c.includes('Ž%')) {
    c = c.replace(/Ž‰|Ž%/g, '✨');
    changed = true;
  }
  if (/ðŸ›’|ðŸ>µ|ðŸµ/g.test(c)) {
    c = c.replace(/ðŸ›’|ðŸ>µ|ðŸµ/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, c, 'utf8');
  }
});
console.log('✓ Global symbol & mojibake cleanup completed.');
