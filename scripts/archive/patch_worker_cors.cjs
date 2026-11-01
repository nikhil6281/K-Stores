const fs = require('fs');

let content = fs.readFileSync('worker/src/index.js', 'utf8');
content = content.replace(/\r\n/g, '\n');

const oldCors = `function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = origin === 'https://nikhil6281.github.io' ||
                    origin.startsWith('http://localhost:') ||
                    origin.startsWith('http://127.0.0.1:');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://nikhil6281.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Razorpay-Signature',
    'Access-Control-Max-Age': '86400'
  };
}`;

const newCors = `function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const isAllowed = origin === 'https://nikhil6281.github.io' ||
                    origin.startsWith('http://localhost:') ||
                    origin.startsWith('http://127.0.0.1:') ||
                    origin === 'capacitor://localhost' ||
                    origin === 'http://localhost' ||
                    origin.startsWith('https://localhost');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://nikhil6281.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Razorpay-Signature',
    'Access-Control-Max-Age': '86400'
  };
}`;

if (content.includes(oldCors)) {
  content = content.replace(oldCors, newCors);
  fs.writeFileSync('worker/src/index.js', content, 'utf8');
  console.log('worker/src/index.js updated with mobile app CORS support');
} else {
  console.log('Warning: oldCors not found in worker/src/index.js');
}
