const fs = require('fs');
const ts = require('typescript');

const source = fs.readFileSync('scripts/temp_script.js', 'utf8');
const sourceFile = ts.createSourceFile('temp_script.js', source, ts.ScriptTarget.Latest, true);

const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram(['scripts/temp_script.js'], { allowJs: true, noEmit: true }));
diagnostics.forEach(diag => {
  if (diag.file) {
    const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
    const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
    console.log(`${diag.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(diag.messageText, '\n'));
  }
});
