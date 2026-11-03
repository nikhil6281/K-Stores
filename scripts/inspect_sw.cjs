const fs = require('fs');

if (fs.existsSync('sw.js')) {
  console.log('sw.js:');
  const sw = fs.readFileSync('sw.js', 'utf8');
  console.log(sw.slice(0, 300));
}

if (fs.existsSync('public/sw.js')) {
  console.log('public/sw.js:');
  const swPub = fs.readFileSync('public/sw.js', 'utf8');
  console.log(swPub.slice(0, 300));
}
