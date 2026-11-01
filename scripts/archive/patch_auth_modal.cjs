const fs = require('fs');

let content = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

const oldBlock = `    try {
      const gUser = await signInWithGoogleReal();
      
      const loggedUser: CustomerUser = {
        id: gUser.id,
        name: gUser.name,
        email: gUser.email,
        phone: gUser.phone || '',
        savedAddress: (gUser as any).savedAddress,
        joinedAt: new Date().toISOString(),
      };`;

const newBlock = `    try {
      const gUser = await signInWithGoogleReal();
      if (!gUser) {
        // Redirect was initiated for mobile webview fallback
        return;
      }
      
      const loggedUser: CustomerUser = {
        id: gUser.id,
        name: gUser.name,
        email: gUser.email,
        phone: gUser.phone || '',
        savedAddress: (gUser as any).savedAddress,
        joinedAt: new Date().toISOString(),
      };`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync('src/components/AuthModal.tsx', content, 'utf8');
  console.log('src/components/AuthModal.tsx updated');
} else {
  console.log('Warning: oldBlock not matched in AuthModal.tsx');
}
