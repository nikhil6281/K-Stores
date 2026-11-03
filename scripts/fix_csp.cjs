const fs = require('fs');

['index.html', 'admin.html', 'worker.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const oldCsp = "https://www.google.com; style-src";
  const newCsp = "https://www.google.com https://*.firebaseio.com https://*.firebaseapp.com; style-src";
  if (content.includes(oldCsp)) {
    content = content.replace(oldCsp, newCsp);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated CSP script-src in ${file}`);
  } else {
    console.log(`Already updated or not found in ${file}`);
  }
});

