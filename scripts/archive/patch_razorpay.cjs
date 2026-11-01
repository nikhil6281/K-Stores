const fs = require('fs');

let content = fs.readFileSync('src/services/razorpay.ts', 'utf8');

const target1 = "http://localhost:5000/api/create-order";
const target2 = "http://localhost:5000/api/verify-payment";

content = content.replace(target1, "https://ra-store-api.chowdarynikhil095.workers.dev/api/create-order");
content = content.replace(target2, "https://ra-store-api.chowdarynikhil095.workers.dev/api/verify-payment");

fs.writeFileSync('src/services/razorpay.ts', content, 'utf8');
console.log('src/services/razorpay.ts updated with Worker API URL');
