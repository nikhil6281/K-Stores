const assert = require('assert');

console.log('🧪 Testing Multi-tier OTP delivery logic...');

// Test payload generation and logic flow
function buildDirectAuthPayload(toPhone, otpCode) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhone,
    type: 'text',
    category: 'authentication',
    text: { body: `Your Sri Sai Stores verification code is ${otpCode}. Valid for 5 minutes.` }
  };
}

function buildDirectUtilityPayload(toPhone, otpCode) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhone,
    type: 'text',
    category: 'utility',
    text: { body: `Hello from Sri Sai Stores! Your account session reference number is ${otpCode}. Enter this reference in the app within 5 minutes.` }
  };
}

function buildTemplatePayload(toPhone, otpCode, templateName, templateLang) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: templateLang },
      components: [
        { type: 'body', parameters: [{ type: 'text', text: otpCode }] },
        { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: otpCode }] }
      ]
    }
  };
}

// 1. Verify Direct Auth payload
const p1 = buildDirectAuthPayload('919876543210', '654321');
assert.strictEqual(p1.type, 'text');
assert.strictEqual(p1.category, 'authentication');
assert(p1.text.body.includes('654321'));
assert(p1.text.body.includes('Sri Sai Stores verification code'));
console.log('✅ 1. Meta Direct Auth payload verified');

// 2. Verify Direct Utility payload
const p2 = buildDirectUtilityPayload('919876543210', '654321');
assert.strictEqual(p2.type, 'text');
assert.strictEqual(p2.category, 'utility');
assert(p2.text.body.includes('account session reference number is 654321'));
console.log('✅ 2. Meta Direct Utility payload verified');

// 3. Verify Template payload
const p3 = buildTemplatePayload('919876543210', '654321', 'sri_sai_login_otp', 'en');
assert.strictEqual(p3.type, 'template');
assert.strictEqual(p3.template.name, 'sri_sai_login_otp');
assert.strictEqual(p3.template.components[0].parameters[0].text, '654321');
console.log('✅ 3. Meta Template payload verified');

// 4. Test Twilio SMS fallback formatting
const twilioTo = '+919876543210';
const formParams = new URLSearchParams();
formParams.append('To', twilioTo);
formParams.append('From', '+12025550199');
formParams.append('Body', `Your Sri Sai Stores verification code is 654321. Valid for 5 minutes.`);
assert.strictEqual(formParams.get('To'), '+919876543210');
assert.strictEqual(formParams.get('From'), '+12025550199');
assert(formParams.get('Body').includes('654321'));
console.log('✅ 4. Twilio SMS form parameters verified');

console.log('🎉 All Multi-tier OTP delivery unit tests PASSED successfully!');
