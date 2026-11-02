const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

console.log('Language button IDs:');
const langMatches = content.match(/id=['"][^'"]*lang[^'"]*['"]/gi) || [];
console.log(langMatches);

console.log('Cart bar IDs:');
const cartBarMatches = content.match(/id=['"][^'"]*cart[^'"]*['"]/gi) || [];
console.log(cartBarMatches);

console.log('Add to cart buttons/classes:');
const addMatches = content.match(/class=['"][^'"]*add[^'"]*['"]/gi) || [];
console.log(addMatches.slice(0, 10));

// Search for any unquoted http in attributes
const httpMatches = content.match(/=[^'"]*http[^\s>]+/gi) || [];
console.log('Unquoted http attributes:', httpMatches);
