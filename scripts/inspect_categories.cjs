const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

function findMatches(pattern, max = 10) {
  const res = [];
  lines.forEach((l, i) => {
    if (pattern.test(l)) res.push({ line: i + 1, text: l.trim().slice(0, 140) });
  });
  return res.slice(0, max);
}

console.log('--- bnavCategoriesBtn ---');
console.log(findMatches(/bnavCategoriesBtn/));

console.log('--- homeView ---');
console.log(findMatches(/id=["']homeView["']/));

console.log('--- accountView ---');
console.log(findMatches(/id=["']accountView["']/));

console.log('--- v2.1.1 ---');
console.log(findMatches(/v2\.1\.1/));

console.log('--- setActiveNavTab ---');
console.log(findMatches(/function setActiveNavTab|setActiveNavTab\s*=/));

console.log('--- currentCategory ---');
console.log(findMatches(/currentCategory\s*=/));

console.log('--- renderCategoryChips ---');
console.log(findMatches(/function renderCategoryChips/));

console.log('--- ?cat= or cat_ ---');
console.log(findMatches(/cat_/));
