const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const rpMatch = content.match(/function renderProducts\(\) \{[\s\S]*?\n    \}/);
if (rpMatch) {
  const rp = rpMatch[0];
  console.log('Includes categoriesView:', rp.includes('categoriesView'));
  console.log('Includes homeView:', rp.includes('homeView'));
  console.log('Includes style.display:', rp.includes('style.display'));
}

