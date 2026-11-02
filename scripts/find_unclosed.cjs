const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIdx = 0;

while ((match = scriptRegex.exec(content)) !== null) {
  scriptIdx++;
  if (scriptIdx === 7) {
    const scriptContent = match[1];
    const prefix = content.slice(0, match.index);
    const startLine = prefix.split('\n').length;

    // Use a JS parser to find exact line
    // Try acorn or oxc or babylon or manual token stack
    // Let's do token/delimiter stack
    let braceStack = []; // stores { char, line, col }
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let inMultiComment = false;
    let isEscaped = false;

    const lines = scriptContent.split('\n');
    for (let r = 0; r < lines.length; r++) {
      const line = lines[r];
      const actualLine = startLine + r;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        const nextChar = line[c + 1] || '';

        if (inComment) {
          continue; // till end of line
        }
        if (inMultiComment) {
          if (char === '*' && nextChar === '/') {
            inMultiComment = false;
            c++;
          }
          continue;
        }

        if (inString) {
          if (isEscaped) {
            isEscaped = false;
            continue;
          }
          if (char === '\\') {
            isEscaped = true;
            continue;
          }
          if (char === stringChar) {
            inString = false;
            stringChar = '';
          }
          continue;
        }

        // Not in string or comment
        if (char === '/' && nextChar === '/') {
          inComment = true;
          break;
        }
        if (char === '/' && nextChar === '*') {
          inMultiComment = true;
          c++;
          continue;
        }

        if (char === '"' || char === "'" || char === '`') {
          inString = true;
          stringChar = char;
          continue;
        }

        if (char === '{' || char === '(' || char === '[') {
          braceStack.push({ char, line: actualLine, col: c + 1 });
        } else if (char === '}' || char === ')' || char === ']') {
          if (braceStack.length === 0) {
            console.log(`Unmatched closing ${char} at line ${actualLine}:${c + 1}`);
          } else {
            const top = braceStack[braceStack.length - 1];
            if (
              (char === '}' && top.char === '{') ||
              (char === ')' && top.char === '(') ||
              (char === ']' && top.char === '[')
            ) {
              braceStack.pop();
            } else {
              console.log(`Mismatched ${char} at line ${actualLine}:${c + 1}, expected close for ${top.char} from line ${top.line}:${top.col}`);
            }
          }
        }
      }
      inComment = false;
    }

    console.log(`End of script. Unclosed delimiters remaining: ${braceStack.length}`);
    if (braceStack.length > 0) {
      console.log('Unclosed items (last 10):');
      braceStack.slice(-10).forEach(b => console.log(`  ${b.char} opened at line ${b.line}:${b.col}`));
    }
  }
}
