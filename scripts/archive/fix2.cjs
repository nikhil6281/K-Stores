// fix2.cjs
const fs = require('fs');

let app = fs.readFileSync('./src/App.tsx', 'utf8');

// Step 1: Remove the broken injection (lines with setIsCartOpen/setShowAdmin outside scope)
app = app.replace(
  /\n\s*\/\/ Listen for header cart\/admin button events[\s\S]{0,500}?\}, \[\]\);/,
  ''
);

// Also remove if it was injected differently
app = app.replace(
  /\n\s*\/\/ Header button events[\s\S]{0,500}?\}, \[\]\);/,
  ''
);

console.log('Step 1: Removed broken injection');

// Step 2: Find the line with setIsCartOpen useState declaration and inject AFTER it
// Pattern: const [isCartOpen, setIsCartOpen] = useState(...)
const lines = app.split('\n');
let insertAfter = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setIsCartOpen') && lines[i].includes('useState')) {
    insertAfter = i;
    break;
  }
}

if (insertAfter === -1) {
  // fallback: find setShowAdmin useState line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('setShowAdmin') && lines[i].includes('useState')) {
      insertAfter = i;
      break;
    }
  }
}

console.log('Step 2: Found injection point at line', insertAfter + 1, ':', lines[insertAfter]?.trim());

if (insertAfter > -1) {
  const eventListenerCode = [
    '',
    '  // Wire header icon buttons to open cart and admin panel',
    '  React.useEffect(() => {',
    '    const handleOpenCart = () => setIsCartOpen(true);',
    '    const handleOpenAdmin = () => setShowAdmin(true);',
    "    window.addEventListener('open-cart', handleOpenCart);",
    "    window.addEventListener('open-admin', handleOpenAdmin);",
    '    return () => {',
    "      window.removeEventListener('open-cart', handleOpenCart);",
    "      window.removeEventListener('open-admin', handleOpenAdmin);",
    '    };',
    '  }, []);',
  ];

  lines.splice(insertAfter + 1, 0, ...eventListenerCode);
  app = lines.join('\n');
  fs.writeFileSync('./src/App.tsx', app, 'utf8');
  console.log('Step 3: Event listeners injected in correct scope');
} else {
  console.log('ERROR: Could not find useState line with setIsCartOpen');
  console.log('Looking for any setIsCartOpen usage...');
  lines.forEach((l, i) => {
    if (l.includes('setIsCartOpen') || l.includes('setShowAdmin')) {
      console.log('  Line ' + (i+1) + ':', l.trim());
    }
  });
}

console.log('\nDone! Run: npm run build');