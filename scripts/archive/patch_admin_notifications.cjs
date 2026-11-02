const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

const isCrlf = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

const notifCardHtml = `
        <!-- Notifications & Marketing Offers Card (Step 3.e) -->
        <div class="card" style="max-width: 600px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px; margin: 0; display: flex; align-items: center; gap: 6px;">
              <span>🔔</span> Customer Push Notifications & Offers
            </h3>
            <span id="notifOptedInCountBadge" class="badge" style="background: #ECFDF5; color: #065F46; font-size: 11px;">0 Opted-in</span>
          </div>
          <p style="font-size: 12px; color: var(--muted); margin-bottom: 14px;">
            Manage automated sales triggers (reorder reminders, back-in-stock alerts, 21-day win-back) and send targeted broadcast offers to opted-in customers.
          </p>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 16px;">
            <div>
              <div style="font-size: 13px; font-weight: 700;">Automatic Sales Offers</div>
              <div style="font-size: 11px; color: var(--muted);">Hourly reorder reminders, back-in-stock alerts, & 21-day win-back offers (max 3/week, 8 AM - 8 PM IST)</div>
            </div>
            <label class="switch" aria-label="Toggle Automatic Sales Offers">
              <input type="checkbox" id="settingAutoOffersEnabled" checked>
              <span class="slider"></span>
            </label>
          </div>

          <div style="border-top: 1px solid var(--border); padding-top: 14px;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 10px;">Send Broadcast Offer</h4>
            
            <div style="margin-bottom: 10px;">
              <label style="font-size: 12px; font-weight: 600;">Offer Title</label>
              <input type="text" id="offerTitleInput" placeholder="e.g. Weekend Fresh Arrivals at RA Store!">
            </div>

            <div style="margin-bottom: 10px;">
              <label style="font-size: 12px; font-weight: 600;">Offer Message</label>
              <textarea id="offerMessageInput" rows="2" style="width: 100%; border: 1px solid var(--border); border-radius: 6px; padding: 8px; font-size: 13px; font-family: inherit;" placeholder="e.g. Fresh local vegetables and fruits just arrived in Old Town. Tap to browse."></textarea>
            </div>

            <div style="margin-bottom: 10px;">
              <label style="font-size: 12px; font-weight: 600;">Optional Deep Link Category</label>
              <select id="offerCategorySelect">
                <option value="">Home Catalog</option>
              </select>
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 12px; font-weight: 600;">Target Audience</label>
              <select id="offerAudienceSelect">
                <option value="all">All Opted-In Customers</option>
                <option value="active14">Ordered in last 14 days</option>
                <option value="inactive14">No order in last 14+ days</option>
              </select>
              <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">
                Estimated recipients: <strong id="offerRecipientCount" style="color: var(--primary);">0</strong> customers
              </div>
            </div>

            <button type="button" class="btn btn-primary" id="btnSendBroadcastOffer" style="min-height: 40px;">
              🚀 Send Offer to Customers
            </button>
          </div>
        </div>`;

const targetButton = '<button class="btn btn-primary" id="saveSettingsBtn">Save All Settings</button>\n        </div>';

if (!content.includes('id="settingAutoOffersEnabled"')) {
  if (content.includes(targetButton)) {
    content = content.replace(targetButton, targetButton + '\n' + notifCardHtml);
    console.log('✅ Injected Notifications card into settingsTab');
  } else {
    console.error('❌ Could not locate targetButton in admin.html');
  }
} else {
  console.log('ℹ️ settingAutoOffersEnabled already present');
}

if (isCrlf) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('Done patching admin.html');
