const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

function printRange(start, end) {
  console.log(`=== LINES ${start} - ${end} ===`);
  for (let i = start - 1; i < end && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}

// 1. Where styles end
console.log('--- Style end ---');
lines.forEach((l, i) => {
  if (l.includes('</style>')) console.log(`${i+1}: ${l}`);
});

// 2. Around line 859
printRange(855, 868);

// 3. Around line 1038
printRange(1035, 1042);

// 4. Around line 1545
printRange(1542, 1550);

// 5. Around line 2100
printRange(2095, 2108);

// 6. Around line 4520-4610
printRange(4520, 4615);
