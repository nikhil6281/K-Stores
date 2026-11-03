const fs = require('fs');

// 1. Update sw.js and public/sw.js
['sw.js', 'public/sw.js'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(/const CACHE_NAME = 'ra-store-shell-v11';/g, "const CACHE_NAME = 'ra-store-shell-v12';");
    if (updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`Updated ${filePath} to ra-store-shell-v12`);
    } else {
      console.log(`Could not find CACHE_NAME in ${filePath}`);
    }
  }
});
