const fs = require('fs');

let code = fs.readFileSync('worker/src/index.js', 'utf8');

// Replace store name
code = code.replace(/store:\s*'RA Store'/g, "store: 'Sri Sai'");
code = code.replace(/Cloudflare Worker for RA Store/g, "Cloudflare Worker for Sri Sai");

// Replace messages to English with Sri Sai
const targetMsgs = `    const msgs = {
      en: {
        placedTitle: 'Order placed ✅',
        placedBody: \`We've received order #\${orderId} (₹\${order.total || ''}).\`,
        acceptedTitle: 'Order confirmed 👍',
        acceptedBody: \`RA Store accepted order #\${orderId}. Packing starts soon.\`,
        packedTitle: 'Order packed 📦',
        packedBody: \`Order #\${orderId} is packed and ready for the rider.\`,
        out_for_deliveryTitle: 'On the way 🛵',
        out_for_deliveryBody: \`Order #\${orderId} is out for delivery. Keep your 4-digit delivery code ready.\`,
        deliveredTitle: 'Delivered ✅',
        deliveredBody: \`Order #\${orderId} delivered. Thank you for shopping with RA Store!\`,
        cancelledTitle: 'Order cancelled',
        cancelledBody: \`Order #\${orderId} was cancelled.\`
      },
      te: {
        placedTitle: 'ఆర్డర్ పూర్తయింది ✅',
        placedBody: \`మేము మీ ఆర్డర్ #\${orderId} (₹\${order.total || ''}) ను స్వీకరించాము.\`,
        acceptedTitle: 'ఆర్డర్ నిర్ధారించబడింది 👍',
        acceptedBody: \`RA స్టోర్ ఆర్డర్ #\${orderId} ను అంగీకరించింది. త్వరలో ప్యాకింగ్ ప్రారంభమవుతుంది.\`,
        packedTitle: 'ఆర్డర్ ప్యాక్ చేయబడింది 📦',
        packedBody: \`ఆర్డర్ #\${orderId} ప్యాక్ చేయబడింది మరియు రైడర్ కోసం సిద్ధంగా ఉంది.\`,
        out_for_deliveryTitle: 'డెలివరీ బయలుదేరింది 🛵',
        out_for_deliveryBody: \`ఆర్డర్ #\${orderId} డెలివరీ కోసం బయలుదేరింది. మీ 4 అంకెల డెలివరీ కోడ్ సిద్ధంగా ఉంచుకోండి.\`,
        deliveredTitle: 'డెలివరీ చేయబడింది ✅',
        deliveredBody: \`ఆర్డర్ #\${orderId} విజయవంతంగా డెలివరీ చేయబడింది. RA స్టోర్‌లో కొనుగోలు చేసినందుకు ధన్యవాదాలు!\`,
        cancelledTitle: 'ఆర్డర్ రద్దు చేయబడింది',
        cancelledBody: \`ఆర్డర్ #\${orderId} రద్దు చేయబడింది.\`
      }
    };

    const dict = msgs[lang] || msgs['te'];`;

const replMsgs = `    // All notifications in English as per Requirement 5
    const dict = {
      placedTitle: 'Order placed ✅',
      placedBody: \`We've received order #\${orderId} (₹\${order.total || ''}).\`,
      acceptedTitle: 'Order confirmed 👍',
      acceptedBody: \`Sri Sai accepted order #\${orderId}. Packing starts soon.\`,
      packedTitle: 'Order packed 📦',
      packedBody: \`Order #\${orderId} is packed and ready for the rider.\`,
      out_for_deliveryTitle: 'On the way 🛵',
      out_for_deliveryBody: \`Order #\${orderId} is out for delivery. Keep your 4-digit delivery code ready.\`,
      deliveredTitle: 'Delivered ✅',
      deliveredBody: \`Order #\${orderId} delivered. Thank you for shopping with Sri Sai!\`,
      cancelledTitle: 'Order cancelled',
      cancelledBody: \`Order #\${orderId} was cancelled.\`
    };`;

code = code.replace(targetMsgs, replMsgs);
code = code.replace(/tag:\s*`ra-order-\${orderId}`/g, "tag: `sri-sai-order-${orderId}`");

fs.writeFileSync('worker/src/index.js', code, 'utf8');
console.log('worker/src/index.js updated successfully!');

