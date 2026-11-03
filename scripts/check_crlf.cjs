const fs = require('fs');

const raw = fs.readFileSync('index.html', 'utf8');
console.log('Uses CRLF:', raw.includes('\r\n'));

console.log('Includes floating-contact-wrap:', raw.includes('.floating-contact-wrap'));
console.log('Includes PART D: ACCOUNT IN-PAGE VIEW:', raw.includes('PART D: ACCOUNT IN-PAGE VIEW'));
console.log('Includes checkStoreHours():', raw.includes('checkStoreHours();'));
