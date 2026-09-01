const fs = require('fs');
const path = require('path');

// 1. Update translations.ts
const transPath = './src/i18n/translations.ts';
if (fs.existsSync(transPath)) {
  let trans = fs.readFileSync(transPath, 'utf8');
  trans = trans.replace(/Main Road, Center Junction, Near Panchayat Office/g, 'Bommalatapalli beside chennampalli road');
  trans = trans.replace(/Everyday:\s*6:00\s*AM\s*[-–to ]*\s*10:00\s*PM/g, 'Everyday: 5:00 AM to 8:30 PM');
  trans = trans.replace(/Sri Venkateswara[^'"]*/g, 'RA General Store');
  trans = trans.replace(/శ్రీ వేంకటేశ్వర[^'"]*/g, 'RA General Store');
  fs.writeFileSync(transPath, trans, 'utf8');
  console.log('✓ Updated translations.ts');
}

// 2. Update Footer.tsx
const footerPath = './src/components/Footer.tsx';
if (fs.existsSync(footerPath)) {
  let footer = fs.readFileSync(footerPath, 'utf8');
  footer = footer.replace(/Main Road, Center Junction, Near Panchayat Office/g, 'Bommalatapalli beside chennampalli road');
  footer = footer.replace(/Everyday:\s*6:00\s*AM\s*[-–to ]*\s*10:00\s*PM/g, 'Everyday: 5:00 AM to 8:30 PM');
  footer = footer.replace(/Sri Venkateswara[^<]*/g, 'RA General Store');
  fs.writeFileSync(footerPath, footer, 'utf8');
  console.log('✓ Updated Footer.tsx');
}

// 3. Update AdminDashboard.tsx with Camera Capture
const adminPath = './src/components/admin/AdminDashboard.tsx';
if (fs.existsSync(adminPath)) {
  let admin = fs.readFileSync(adminPath, 'utf8');
  
  const cameraBlock = `              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Product Photo (Camera / Upload)*
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setNewProduct(prev => ({ ...prev, image: reader.result as string }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#166534] file:text-white hover:file:bg-emerald-700 cursor-pointer bg-slate-900/60 p-2 rounded-xl border border-slate-700"
                />
                {newProduct.image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={newProduct.image} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-slate-700" />
                    <span className="text-[11px] text-emerald-400 font-medium">✓ Photo Attached</span>
                  </div>
                )}
              </div>`;

  if (admin.includes('Product Image URL')) {
    admin = admin.replace(/<div className="space-y-1\.5">\s*<label[^>]*>Product Image URL[\s\S]*?<\/div>\s*<\/div>/, cameraBlock);
    fs.writeFileSync(adminPath, admin, 'utf8');
    console.log('✓ Updated Camera Capture in AdminDashboard.tsx');
  }
}

// 4. Global replacement across all source files for Rupee symbol & Mojibake
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

  // Rupee symbol fix
  if (c.includes('â‚¹') || c.includes('â,¹') || c.includes('\u00e2\u201a\u00b9')) {
    c = c.replace(/â‚¹|â,¹|\u00e2\u201a\u00b9/g, '₹');
    changed = true;
  }
  if (c.includes('â€¢')) {
    c = c.replace(/â€¢/g, '•');
    changed = true;
  }
  if (c.includes('âš¡')) {
    c = c.replace(/âš¡/g, '');
    changed = true;
  }
  if (c.includes('Main Road, Center Junction, Near Panchayat Office')) {
    c = c.replace(/Main Road, Center Junction, Near Panchayat Office/g, 'Bommalatapalli beside chennampalli road');
    changed = true;
  }
  if (/Everyday:\s*6:00\s*AM\s*[-–to ]*\s*10:00\s*PM/g.test(c)) {
    c = c.replace(/Everyday:\s*6:00\s*AM\s*[-–to ]*\s*10:00\s*PM/g, 'Everyday: 5:00 AM to 8:30 PM');
    changed = true;
  }
  if (c.includes('20 Min Superfast Village Delivery')) {
    c = c.replace(/.*20 Min Superfast Village Delivery[\s\S]*?WhatsApp bill generation\..*/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, c, 'utf8');
  }
});
console.log('✓ Global currency & mojibake cleanup completed.');
