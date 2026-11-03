const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const cssMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
if (cssMatch) {
  const css = cssMatch[1];
  console.log('CSS length:', css.length);
  // Look for --primary, --text, --border, etc.
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (rootMatch) console.log(':root =', rootMatch[1]);
  // Look for .grid
  const gridMatch = css.match(/\.grid\s*\{([\s\S]*?)\}/);
  if (gridMatch) console.log('.grid =', gridMatch[1]);
}
