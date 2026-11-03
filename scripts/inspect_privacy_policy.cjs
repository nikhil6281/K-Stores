const fs = require('fs');

const pp = fs.readFileSync('privacy-policy.html', 'utf8');
console.log('Includes delete or data deletion:', pp.includes('delete') || pp.includes('deletion') || pp.includes('Remove'));
console.log('Includes grievance / contact:', pp.includes('grievance') || pp.includes('Grievance') || pp.includes('6281730144'));
const lines = pp.split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('delete') || l.toLowerCase().includes('retention') || l.toLowerCase().includes('grievance')) {
    console.log(`${i+1}: ${l.trim()}`);
  }
});

