const fs = require('fs');

const pages = [
  'about-us.html',
  'contact-us.html',
  'terms.html',
  'privacy-policy.html',
  'refund-policy.html',
  'shipping-policy.html',
  'offline.html',
  '404.html'
];

pages.forEach(filename => {
  if (!fs.existsSync(filename)) return;
  let content = fs.readFileSync(filename, 'utf8');

  // Favicon update
  content = content.replace(
    /<link rel="icon" href="[^"]+">/g,
    '<link rel="icon" type="image/png" sizes="48x48" href="./assets/logo/favicon-48.png?v=2">'
  );

  // Address normalization: avoid "Sri Sai • Sri Sai General Store..."
  content = content.replace(/Sri Sai General Store, Old Town, Anantapur/g, 'Old Town, Anantapur');

  // Brand replacement
  content = content.replace(/RA Store/g, 'Sri Sai');
  content = content.replace(/RA Stores/g, 'Sri Sai');
  content = content.replace(/RA STORE/g, 'Sri Sai');

  // Emails
  content = content.replace(/support@rastore\.in/g, 'support@srisai.in');
  content = content.replace(/grievance@rastore\.in/g, 'grievance@srisai.in');

  if (filename === 'privacy-policy.html') {
    content = content.replace(
      /10-Digit Mobile Number:<\/strong> For WhatsApp order updates, OTP authentication, and delivery coordination\./g,
      'Contact Phone Number:</strong> For delivery rider coordination and order contact.'
    );
    content = content.replace(
      /Phone authentication \(SMS \/ WhatsApp OTP\) or Google Account email/g,
      'Email OTP authentication (6-digit verification code) or Google Account'
    );
  }

  if (filename === 'terms.html') {
    content = content.replace(/SMS OTP/g, 'Email OTP');
    content = content.replace(/phone number login/g, 'email OTP login');
  }

  fs.writeFileSync(filename, content, 'utf8');
  console.log(`Updated ${filename}`);
});

