import assert from 'node:assert';
import { sendWhatsappViaMeta } from '../worker/src/index.js';

async function run() {
  console.log('--- Testing sendWhatsappViaMeta ---');
  let capturedUrl = null;
  let capturedHeaders = null;
  let capturedBody = null;

  // Test 1: Successful send with default template name & lang
  globalThis.fetch = async (url, options) => {
    capturedUrl = url;
    capturedHeaders = options.headers;
    capturedBody = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'wamid.HBgMOTE3OTg5NzkyOTM3FQIAERgSQTY0QjM5RkM1NzY0NTE5NkI2AA==' }] })
    };
  };

  const res = await sendWhatsappViaMeta('7989792937', '483920', {
    WHATSAPP_PHONE_NUMBER_ID: 'X',
    WHATSAPP_ACCESS_TOKEN: 'T'
  });

  assert.strictEqual(res.success, true, 'Result must be success: true');
  assert.strictEqual(res.messageId, 'wamid.HBgMOTE3OTg5NzkyOTM3FQIAERgSQTY0QjM5RkM1NzY0NTE5NkI2AA==');
  assert.strictEqual(capturedUrl, 'https://graph.facebook.com/v21.0/X/messages');
  assert.strictEqual(capturedHeaders['Authorization'], 'Bearer T');

  assert.strictEqual(capturedBody.type, 'template', "Payload type must be 'template'");
  assert.strictEqual(capturedBody.to, '917989792937', "Recipient must be normalized with 91 prefix");
  assert.strictEqual(capturedBody.template.name, 'sri_sai_login_otp', "Template name must be 'sri_sai_login_otp'");
  assert.strictEqual(capturedBody.template.language.code, 'en', "Template language must be 'en'");
  assert.strictEqual(capturedBody.text, undefined, "There must be no 'text' field");

  const components = capturedBody.template.components;
  assert.strictEqual(components[0].type, 'body', 'First component must be body');
  assert.strictEqual(components[0].parameters[0].type, 'text');
  assert.strictEqual(components[0].parameters[0].text, '483920');

  assert.strictEqual(components[1].type, 'button', 'Second component must be button');
  assert.strictEqual(components[1].sub_type, 'url');
  assert.strictEqual(components[1].index, '0');
  assert.strictEqual(components[1].parameters[0].type, 'text');
  assert.strictEqual(components[1].parameters[0].text, '483920');

  console.log('✅ Assertion 1 passed: template structure, body, button, no text field, normalized phone.');

  // Test 2: Throws when env has no credentials
  let threwWithoutCreds = false;
  try {
    await sendWhatsappViaMeta('7989792937', '483920', {});
  } catch (err) {
    threwWithoutCreds = true;
    assert(err.message.includes('credentials not configured'), 'Error message must mention credentials not configured');
  }
  assert.strictEqual(threwWithoutCreds, true, 'Must throw when env has no credentials');

  let threwWithoutToken = false;
  try {
    await sendWhatsappViaMeta('7989792937', '483920', { WHATSAPP_PHONE_NUMBER_ID: 'X' });
  } catch (err) {
    threwWithoutToken = true;
  }
  assert.strictEqual(threwWithoutToken, true, 'Must throw when WHATSAPP_ACCESS_TOKEN is missing');

  console.log('✅ Assertion 2 passed: throws when env has no credentials.');

  // Test 3: Meta error 132001 returns success:false with customer-safe message and does not leak token
  globalThis.fetch = async () => {
    return {
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          message: 'Template name does not exist in the translation',
          type: 'OAuthException',
          code: 132001,
          error_subcode: 2388073,
          fbtrace_id: 'Az92k1'
        }
      })
    };
  };

  const errRes = await sendWhatsappViaMeta('7989792937', '483920', {
    WHATSAPP_PHONE_NUMBER_ID: 'X',
    WHATSAPP_ACCESS_TOKEN: 'SECRET_TOKEN_T'
  });

  assert.strictEqual(errRes.success, false, 'Result must be success: false');
  assert.strictEqual(errRes.metaCode, 132001, 'metaCode must be 132001');
  assert(errRes.error.includes('We could not send the WhatsApp code right now'), 'Must return customer-safe message');
  assert(!JSON.stringify(errRes).includes('SECRET_TOKEN_T'), 'Must not leak token in error response');

  console.log('✅ Assertion 3 passed: Meta error 132001 returns success:false with customer-safe message and does not leak token.');

  // Test 4: Meta error 131026 returns not on WhatsApp message
  globalThis.fetch = async () => {
    return {
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          message: 'Receiver is incapable of receiving this message',
          type: 'OAuthException',
          code: 131026
        }
      })
    };
  };

  const notOnWaRes = await sendWhatsappViaMeta('7989792937', '483920', {
    WHATSAPP_PHONE_NUMBER_ID: 'X',
    WHATSAPP_ACCESS_TOKEN: 'SECRET_TOKEN_T'
  });

  assert.strictEqual(notOnWaRes.success, false);
  assert.strictEqual(notOnWaRes.metaCode, 131026);
  assert(notOnWaRes.error.includes('does not appear to be on WhatsApp'), 'Must return number not on WhatsApp message');

  console.log('✅ Assertion 4 passed: Meta error 131026 returns helpful WhatsApp number notice.');

  console.log('\n🎉 ALL UNIT ASSERTIONS PASSED!');
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
