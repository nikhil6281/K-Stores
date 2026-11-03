const https = require('https');

https.get('https://k-store-ae9dd-default-rtdb.firebaseio.com/categories.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const cats = JSON.parse(data);
      console.log('Categories count:', Object.keys(cats).length);
      Object.keys(cats).forEach(k => {
        const c = cats[k];
        console.log(`- ${k}: icon=${c.icon} name="${c.name}" nameTe="${c.nameTe}" active=${c.active} order=${c.order}`);
      });
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', err => console.error(err));
