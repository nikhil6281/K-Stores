const fs = require('fs');

let content = fs.readFileSync('database.rules.json', 'utf8');
content = content.replace(/\r\n/g, '\n');

const oldRule = `        ".write": "auth != null && (root.child('admins').child(auth.uid).val() === true || (root.child('staff').child(auth.uid).child('active').val() === true && data.exists() && newData.exists() && newData.child('status').val() != 'cancelled' && newData.child('status').val() != 'delivered' && data.child('status').val() != 'cancelled'))",`;

const newRule = `        ".write": "auth != null && (root.child('admins').child(auth.uid).val() === true || (!data.exists() && newData.child('uid').val() === auth.uid) || (root.child('staff').child(auth.uid).child('active').val() === true && data.exists() && newData.exists() && newData.child('status').val() != 'cancelled' && newData.child('status').val() != 'delivered' && data.child('status').val() != 'cancelled'))",`;

if (content.includes(oldRule)) {
  content = content.replace(oldRule, newRule);
  fs.writeFileSync('database.rules.json', content, 'utf8');
  console.log('database.rules.json updated to permit authenticated customer order creation');
} else {
  console.log('Warning: oldRule not matched');
}
