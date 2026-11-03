const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

function printRange(start, end) {
  console.log(`=== LINES ${start} - ${end} ===`);
  for (let i = start - 1; i < end && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

// 1. HomeView and AccountView boundary
printRange(850, 875);

// 2. Bottom nav
printRange(1050, 1080);

// 3. Version
printRange(1035, 1045);
printRange(1540, 1555);

// 4. renderCategoryChips & category filtering
printRange(2715, 2820);

// 5. setActiveNavTab & bottom nav handlers
printRange(4515, 4600);
