const fs = require('fs');
const vm = require('vm');

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

    try {
      new vm.Script(scriptContent, { filename: 'index.html', lineOffset: startLine - 1 });
    } catch (e) {
      console.log('Script 7 Error details:');
      console.log(e.stack);
      
      // Let's print around the reported line
      const matchLine = e.stack.match(/index\.html:(\d+)/);
      if (matchLine) {
        const lineNum = parseInt(matchLine[1], 10);
        console.log('Reported Line:', lineNum);
        const allLines = content.split('\n');
        for (let i = Math.max(0, lineNum - 10); i < Math.min(allLines.length, lineNum + 10); i++) {
          console.log(`${i + 1}: ${allLines[i]}`);
        }
      }
    }
  }
}
