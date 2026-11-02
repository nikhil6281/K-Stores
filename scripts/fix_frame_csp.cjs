const fs = require('fs');

['index.html', 'admin.html', 'worker.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const oldFrame = "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://api.razorpay.com https://www.google.com";
  const newFrame = "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://*.firebaseio.com https://api.razorpay.com https://www.google.com";
  if (content.includes(oldFrame)) {
    content = content.replace(oldFrame, newFrame);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated frame-src in ${file}`);
  }
});
