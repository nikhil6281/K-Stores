const fs = require('fs');

['index.html', 'worker.html', 'admin.html'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log('=== ' + file + ' ===');
  lines.forEach((l, i) => {
    if (
      l.includes('loginModal') ||
      l.includes('signInWith') ||
      l.includes('recaptcha') ||
      l.includes('phone') && (l.includes('Auth') || l.includes('OTP') || l.includes('otp')) ||
      l.includes('GoogleAuthProvider')
    ) {
      console.log((i + 1) + ': ' + l.trim().substring(0, 140));
    }
  });
});

