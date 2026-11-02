const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, '..', 'database.rules.json');
let content = fs.readFileSync(rulesPath, 'utf8');

const target = `        "addresses": {
          ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
          ".write": "auth != null && auth.uid === $uid"
        }`;

const replacement = `        "addresses": {
          ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
          ".write": "auth != null && auth.uid === $uid"
        },
        "fcmTokens": {
          ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
          "$tokenId": {
            ".write": "auth != null && auth.uid === $uid"
          }
        },
        "notificationPreferences": {
          ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
          ".write": "auth != null && auth.uid === $uid"
        },
        "offerHistory": {
          ".read": "auth != null && (auth.uid === $uid || root.child('admins').child(auth.uid).val() === true)",
          ".write": "auth != null && auth.uid === $uid"
        }`;

// Replace CRLF or LF safely
content = content.replace(/\r\n/g, '\n');
const targetLf = target.replace(/\r\n/g, '\n');
const replacementLf = replacement.replace(/\r\n/g, '\n');

if (content.includes(targetLf)) {
  content = content.replace(targetLf, replacementLf);
  console.log('✅ Added fcmTokens and notificationPreferences to database.rules.json');
} else {
  console.warn('⚠️ Could not match target in database.rules.json');
}

// Convert back to CRLF
content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(rulesPath, content, 'utf8');
