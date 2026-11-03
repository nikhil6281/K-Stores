const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
const EOL = isCrlf ? '\r\n' : '\n';

function replaceStrict(str, target, replacement, label) {
  const normalizedTarget = target.replace(/\r?\n/g, EOL);
  const normalizedReplacement = replacement.replace(/\r?\n/g, EOL);
  if (!str.includes(normalizedTarget)) {
    throw new Error(`Target not found for: ${label}`);
  }
  return str.replace(normalizedTarget, normalizedReplacement);
}

const target = `        if (anyOpen) {
          document.body.classList.add('overlay-open');
          document.body.classList.add('signin-open');
        } else {
          document.body.classList.remove('overlay-open');
          document.body.classList.remove('signin-open');
        }`;

const replacement = `        if (anyOpen) {
          document.body.classList.add('overlay-open');
        } else {
          document.body.classList.remove('overlay-open');
        }
        const loginEl = document.getElementById('loginModal');
        const isLoginOpen = loginEl && isOverlayOpen(loginEl);
        if (isLoginOpen) {
          document.body.classList.add('signin-open');
        } else {
          document.body.classList.remove('signin-open');
        }`;

html = replaceStrict(html, target, replacement, 'Fix signin-open in syncBottomBar');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed signin-open in syncBottomBar successfully!');

