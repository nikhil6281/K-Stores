// fix3.cjs — surgical fix for App.tsx
const fs = require('fs');

let app = fs.readFileSync('./src/App.tsx', 'utf8');
const lines = app.split('\n');

// Show lines 90-110 so we know what's there
console.log('=== App.tsx lines 88-110 ===');
for (let i = 87; i < Math.min(110, lines.length); i++) {
  console.log((i+1) + ': ' + lines[i]);
}
console.log('=== END ===\n');

// Find and remove the entire broken useEffect block
// It starts with "// Listen for header" or "// Wire header" or contains openCart/openAdmin
let blockStart = -1;
let blockEnd = -1;
let depth = 0;

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  // Find start of broken block
  if (blockStart === -1 && (
    (l.includes('openCart') && l.includes('setIsCartOpen')) ||
    (l.includes('openAdmin') && l.includes('setShowAdmin')) ||
    (l.includes('// Listen for header') ) ||
    (l.includes('// Wire header icon'))
  )) {
    // Walk back to find the useEffect or comment line
    let start = i;
    while (start > 0 && (lines[start-1].trim() === '' || lines[start-1].includes('useEffect') || lines[start-1].includes('//'))) {
      start--;
    }
    blockStart = start;
    // Walk forward to find closing }); 
    depth = 0;
    for (let j = i; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      if (j > i && depth <= 0 && lines[j].includes('});')) {
        blockEnd = j;
        break;
      }
    }
    break;
  }
}

if (blockStart > -1 && blockEnd > -1) {
  console.log('Found broken block from line ' + (blockStart+1) + ' to ' + (blockEnd+1));
  lines.splice(blockStart, blockEnd - blockStart + 1);
  console.log('Removed broken useEffect block');
} else {
  // Simpler fallback: just remove any line containing openCart or openAdmin 
  console.log('Block not found, removing individual lines...');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (
      lines[i].includes('const openCart') ||
      lines[i].includes('const openAdmin') ||
      (lines[i].includes('open-cart') && lines[i].includes('addEventListener')) ||
      (lines[i].includes('open-admin') && lines[i].includes('addEventListener')) ||
      (lines[i].includes('open-cart') && lines[i].includes('removeEventListener')) ||
      (lines[i].includes('open-admin') && lines[i].includes('removeEventListener')) ||
      lines[i].includes('// Listen for header') ||
      lines[i].includes('// Wire header icon') ||
      lines[i].includes('// Header button events')
    ) {
      console.log('Removing line ' + (i+1) + ': ' + lines[i].trim());
      lines.splice(i, 1);
    }
  }
  // Also remove empty useEffect shells that are now empty
  for (let i = lines.length - 1; i >= 2; i--) {
    if (
      lines[i].trim() === '}, []);' &&
      lines[i-1].trim() === '' &&
      lines[i-2].trim().includes('useEffect')
    ) {
      lines.splice(i-2, 3);
      console.log('Removed empty useEffect at line ' + (i-1));
    }
  }
}

// Now find the CORRECT injection point: right after the useState that has setIsCartOpen
let injectAt = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setIsCartOpen') && lines[i].includes('useState')) {
    injectAt = i;
    console.log('Will inject after line ' + (i+1) + ': ' + lines[i].trim());
    break;
  }
}

if (injectAt > -1) {
  const inject = [
    '',
    '  // Header cart + admin button wiring',
    '  React.useEffect(() => {',
    "    const oc = () => setIsCartOpen(true);",
    "    const oa = () => setShowAdmin(true);",
    "    window.addEventListener('open-cart', oc);",
    "    window.addEventListener('open-admin', oa);",
    '    return () => {',
    "      window.removeEventListener('open-cart', oc);",
    "      window.removeEventListener('open-admin', oa);",
    '    };',
    '  }, []);',
  ];
  lines.splice(injectAt + 1, 0, ...inject);
  console.log('Injected event listeners in correct position');
} else {
  console.log('WARNING: Could not find setIsCartOpen useState — skipping injection');
  console.log('Searching all setIsCartOpen/setShowAdmin occurrences:');
  lines.forEach((l, i) => {
    if (l.includes('setIsCartOpen') || l.includes('setShowAdmin')) {
      console.log('  Line ' + (i+1) + ': ' + l.trim());
    }
  });
}

fs.writeFileSync('./src/App.tsx', lines.join('\n'), 'utf8');
console.log('\nDone! Run: npm run build');