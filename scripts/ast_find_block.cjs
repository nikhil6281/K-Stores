const fs = require('fs');
const ts = require('typescript');

const source = fs.readFileSync('scripts/temp_script.js', 'utf8');
const sf = ts.createSourceFile('temp_script.js', source, ts.ScriptTarget.Latest, true);

sf.statements.forEach(stmt => {
  const start = sf.getLineAndCharacterOfPosition(stmt.getStart());
  const end = sf.getLineAndCharacterOfPosition(stmt.getEnd());
  const text = stmt.getText(sf).slice(0, 50).replace(/\n/g, ' ');
  if (start.line > 3500 || end.line >= 4130) {
    console.log(`Line ${start.line + 1} to ${end.line + 1}: ${ts.SyntaxKind[stmt.kind]} - ${text}`);
  }
});
