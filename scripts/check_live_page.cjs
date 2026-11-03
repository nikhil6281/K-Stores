const https = require('https');

https.get('https://nikhil6281.github.io/K-Stores/index.html?t=' + Date.now(), (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Contains v2.1.2:', data.includes('v2.1.2'));
    console.log('Contains categoriesView:', data.includes('id="categoriesView"'));
  });
}).on('error', err => console.error(err));

