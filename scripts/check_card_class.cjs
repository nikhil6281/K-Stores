const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
console.log('product-card matches:', content.match(/class=["'][^"']*product-card/g));
console.log('card matches in renderProductCardHtml:', content.includes('renderProductCardHtml'));

