const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
console.log('shimmer matches:', content.includes('shimmer'));
