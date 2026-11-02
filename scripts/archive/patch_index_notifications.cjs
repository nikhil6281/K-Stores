const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Add firebase-messaging-compat.js to <head> if not present
if (!content.includes('firebase-messaging-compat.js')) {
  const targetScript = '<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>';
  const newScript = targetScript + '\n  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"></script>';
  content = content.replace(targetScript, newScript);
  console.log('✅ Added firebase-messaging-compat.js to <head>');
}

// 2. Add switch styles in <style>
const switchStyles = `
    /* Notifications Toggle Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .switch .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #CBD5E1;
      transition: .25s ease;
      border-radius: 24px;
    }
    .switch .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .25s ease;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .switch input:checked + .slider {
      background-color: var(--primary, #0C831F);
    }
    .switch input:checked + .slider:before {
      transform: translateX(20px);
    }
`;

if (!content.includes('.switch input:checked + .slider')) {
  content = content.replace('/* CHANGE 1: Fixed bottom bar', switchStyles + '\n    /* CHANGE 1: Fixed bottom bar');
  console.log('✅ Added switch CSS for notification toggles');
}

// 3. Add Notifications Card in Account View
const notifCardHtml = `
      <!-- Notifications Settings Card (Step 2) -->
      <div class="card" id="accountNotificationsCard" style="margin-bottom: 14px; padding: 16px; background: #FFFFFF; border-radius: 12px; border: 1px solid var(--border);">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>🔔</span> <span id="tNotifCardTitle">Notifications</span>
          </div>
          <span id="notifPermissionStatusBadge" style="font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #FEF3C7; color: #92400E; font-weight: 600;">Check status</span>
        </h3>
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border);">
          <div style="padding-right: 12px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text);" id="tNotifOrderUpdatesTitle">Order updates</div>
            <div style="font-size: 11px; color: var(--muted);" id="tNotifOrderUpdatesSub">Live alerts for order placed, accepted, packed, and out for delivery</div>
          </div>
          <label class="switch" aria-label="Toggle Order updates">
            <input type="checkbox" id="toggleNotifOrderUpdates" checked>
            <span class="slider"></span>
          </label>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
          <div style="padding-right: 12px;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text);" id="tNotifOffersTitle">Offers & reminders</div>
            <div style="font-size: 11px; color: var(--muted);" id="tNotifOffersSub">Reorder reminders and occasional deals (max 3 a week)</div>
          </div>
          <label class="switch" aria-label="Toggle Offers and reminders">
            <input type="checkbox" id="toggleNotifOffers" checked>
            <span class="slider"></span>
          </label>
        </div>

        <button type="button" class="btn btn-outline" id="btnEnableNotificationsPrompt" style="width: 100%; justify-content: center; font-size: 12px; font-weight: 700; color: var(--primary); border-color: var(--primary); margin-top: 10px; display: none;">
          🔔 Turn on Device Notifications
        </button>
      </div>
`;

if (!content.includes('id="accountNotificationsCard"')) {
  const targetSavedAddresses = '<!-- 3. Saved Addresses Section -->';
  content = content.replace(targetSavedAddresses, notifCardHtml + '\n      ' + targetSavedAddresses);
  console.log('✅ Injected Notifications card into Account view');
}

// 4. Add Notification Prompt inside successModal
const notifPromptHtml = `
      <!-- Post-Order Notification Prompt (Step 2) -->
      <div id="successNotifPromptBox" style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 12px; margin-bottom: 16px; text-align: left;">
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-size: 20px;">🔔</span>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 700; color: #166534;" id="tSuccessNotifPromptTitle">Get live updates for this order?</div>
            <div style="font-size: 11px; color: #166534; margin-top: 2px; line-height: 1.4;" id="tSuccessNotifPromptSub">We'll also send occasional offers (max 3 a week). You can turn these off anytime in Account.</div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button type="button" class="btn btn-primary" id="btnAllowOrderNotifs" style="font-size: 12px; padding: 6px 14px; min-height: 36px; background: #166534; border-color: #166534;">Allow</button>
              <button type="button" class="btn btn-light" id="btnDismissOrderNotifs" style="font-size: 12px; padding: 6px 12px; min-height: 36px; color: #4B5563;">Not now</button>
            </div>
          </div>
        </div>
      </div>

      <div id="successInAppBrowserHint" style="display: none; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 10px 12px; margin-bottom: 16px; text-align: left; font-size: 12px; color: #92400E;">
        📲 <strong>Want live updates on this order?</strong><br>
        <span style="font-size: 11px; line-height: 1.4;">In-app browsers (WhatsApp / Instagram) block push notifications. Open RA Store in Chrome to get instant delivery alerts.</span>
      </div>
`;

if (!content.includes('id="successNotifPromptBox"')) {
  const targetSuccessRefund = '<div style="background: #FEF3C7; border-left: 4px solid var(--accent); padding: 8px 12px; border-radius: 6px; font-size: 12px; color: #92400E; margin-bottom: 16px; text-align: left;">';
  content = content.replace(targetSuccessRefund, notifPromptHtml + '\n      ' + targetSuccessRefund);
  console.log('✅ Injected post-order notification prompt into successModal');
}

// 5. Add I18N translations
const enNotifI18n = `        notifCardTitle: "Notifications",
        notifOrderUpdatesTitle: "Order updates",
        notifOrderUpdatesSub: "Live alerts for order placed, accepted, packed, and out for delivery",
        notifOffersTitle: "Offers & reminders",
        notifOffersSub: "Reorder reminders and occasional deals (max 3 a week)",
        successNotifPromptTitle: "Get live updates for this order?",
        successNotifPromptSub: "We'll also send occasional offers (max 3 a week). You can turn these off anytime in Account.",
        notifAllowedToast: "Notifications enabled! You'll receive live order tracking updates.",
        notifBlockedToast: "Notifications are blocked in your browser settings.",`;

const teNotifI18n = `        notifCardTitle: "నోటిఫికేషన్లు",
        notifOrderUpdatesTitle: "ఆర్డర్ అప్‌డేట్లు",
        notifOrderUpdatesSub: "ఆర్డర్ స్వీకరణ, ప్యాకింగ్, మరియు డెలివరీ బయలుదేరిన లైవ్ అలర్ట్‌లు",
        notifOffersTitle: "ఆఫర్లు & రిమైండర్లు",
        notifOffersSub: "సరుకుల రీ-ఆర్డర్ రిమైండర్లు మరియు ప్రత్యేక ఆఫర్లు (వారానికి గరిష్టంగా 3)",
        successNotifPromptTitle: "ఈ ఆర్డర్ కోసం లైవ్ అప్‌డేట్లు పొందాలా?",
        successNotifPromptSub: "మేము అప్పుడప్పుడు ఆఫర్లను కూడా పంపుతాము (వారానికి గరిష్టంగా 3). వీటిని ఖాతాలో ఎప్పుడైనా ఆపివేయవచ్చు.",
        notifAllowedToast: "నోటిఫికేషన్లు ప్రారంభించబడ్డాయి! మీరు లైవ్ ఆర్డర్ ట్రాకింగ్ పొందుతారు.",
        notifBlockedToast: "మీ బ్రౌజర్ సెట్టింగ్‌లలో నోటిఫికేషన్లు నిరోధించబడ్డాయి.",`;

content = content.replace(
  /pastOrdersTitle:\s*"Past Orders",/,
  `pastOrdersTitle: "Past Orders",\n${enNotifI18n}`
);

content = content.replace(
  /pastOrdersTitle:\s*"గత ఆర్డర్లు",/,
  `pastOrdersTitle: "గత ఆర్డర్లు",\n${teNotifI18n}`
);

// 6. Add JS Implementation for FCM, Prompts, and Preferences
const notifJsImplementation = `
    // ========================================================
    // NOTIFICATIONS & FCM WEB PUSH (STEPS 2 & 3)
    // ========================================================
    let fcmMessaging = null;
    try {
      if ('Notification' in window && 'serviceWorker' in navigator && firebase.messaging) {
        fcmMessaging = firebase.messaging();
      }
    } catch (e) {
      console.warn('[FCM] Messaging init warning:', e);
    }

    // Foreground notification toast listener
    if (fcmMessaging) {
      fcmMessaging.onMessage((payload) => {
        console.log('[FCM] Foreground message received:', payload);
        const title = (payload.notification && payload.notification.title) || (payload.data && payload.data.title) || 'RA Store';
        const body = (payload.notification && payload.notification.body) || (payload.data && payload.data.body) || '';
        showToast(\`\${title}: \${body}\`);
        
        // If related to orders, refresh or trigger status audio
        if (currentUser) {
          playSuccessChime();
        }
      });
    }

    // Service Worker message listener (handles clicking notification when window is already open)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NAVIGATE_TO_ORDER') {
          openOrdersModal();
        }
      });
    }

    // Check URL parameters for ?order=<id> or ?n=<offerId>
    window.addEventListener('DOMContentLoaded', () => {
      const p = new URLSearchParams(window.location.search);
      const targetOrderId = p.get('order');
      if (targetOrderId) {
        setTimeout(() => {
          openOrdersModal();
        }, 600);
      }
      const offerId = p.get('n');
      if (offerId && currentUser) {
        // Record offer open
        db.ref(\`users/\${currentUser.uid}/offerHistory/\${offerId}/openedAt\`).set(new Date().toISOString()).catch(() => {});
        // Also ping backend if available
        fetch(\`\${WORKER_API}/api/record-offer-open\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: currentUser.uid, offerId: offerId })
        }).catch(() => {});
      }
    });

    async function registerFcmToken() {
      if (!fcmMessaging || !currentUser || !('Notification' in window)) return null;
      if (Notification.permission !== 'granted') return null;

      try {
        const registration = await navigator.serviceWorker.ready;
        const vapidKey = (window.APP_CONFIG && window.APP_CONFIG.fcmVapidKey) || undefined;
        const token = await fcmMessaging.getToken({
          serviceWorkerRegistration: registration,
          vapidKey: vapidKey
        });

        if (token) {
          const tokenHash = btoa(token.slice(-16)).replace(/[^a-zA-Z0-9]/g, '');
          const tokenRecord = {
            token: token,
            lang: currentLang || 'te',
            platform: 'web',
            userAgent: (navigator.userAgent || '').slice(0, 100),
            updatedAt: new Date().toISOString()
          };

          await db.ref(\`users/\${currentUser.uid}/fcmTokens/\${tokenHash}\`).set(tokenRecord);
          localStorage.setItem('ra_current_fcm_token_hash', tokenHash);
          localStorage.setItem('ra_current_fcm_token', token);
          console.log('[FCM] Device token registered successfully');
          updateNotificationUI();
          return token;
        }
      } catch (err) {
        console.warn('[FCM] Token registration error:', err);
      }
      return null;
    }

    async function removeCurrentDeviceToken() {
      if (!currentUser) return;
      const tokenHash = localStorage.getItem('ra_current_fcm_token_hash');
      if (tokenHash) {
        try {
          await db.ref(\`users/\${currentUser.uid}/fcmTokens/\${tokenHash}\`).remove();
          localStorage.removeItem('ra_current_fcm_token_hash');
          localStorage.removeItem('ra_current_fcm_token');
          console.log('[FCM] Device token removed');
        } catch (e) {
          console.warn('[FCM] Token removal error:', e);
        }
      }
    }

    function updateNotificationUI() {
      const badge = document.getElementById('notifPermissionStatusBadge');
      const enableBtn = document.getElementById('btnEnableNotificationsPrompt');
      const orderToggle = document.getElementById('toggleNotifOrderUpdates');
      const offerToggle = document.getElementById('toggleNotifOffers');

      if (!('Notification' in window)) {
        if (badge) {
          badge.innerText = 'Not Supported';
          badge.style.background = '#F3F4F6';
          badge.style.color = '#6B7280';
        }
        return;
      }

      const perm = Notification.permission;
      if (perm === 'granted') {
        if (badge) {
          badge.innerText = 'Active ✅';
          badge.style.background = '#DCFCE7';
          badge.style.color = '#166534';
        }
        if (enableBtn) enableBtn.style.display = 'none';
      } else if (perm === 'denied') {
        if (badge) {
          badge.innerText = 'Blocked ✕';
          badge.style.background = '#FEE2E2';
          badge.style.color = '#991B1B';
        }
        if (enableBtn) enableBtn.style.display = 'none';
      } else {
        if (badge) {
          badge.innerText = 'Not Enabled';
          badge.style.background = '#FEF3C7';
          badge.style.color = '#92400E';
        }
        if (enableBtn) enableBtn.style.display = 'inline-flex';
      }

      // Load saved preferences
      if (currentUser) {
        db.ref(\`users/\${currentUser.uid}/notificationPreferences\`).once('value').then(snap => {
          const val = snap.val() || {};
          if (orderToggle) orderToggle.checked = (val.orderUpdates !== false);
          if (offerToggle) offerToggle.checked = (val.offersAndReminders !== false);
        }).catch(() => {});
      }
    }

    // Toggle handlers for Account preferences
    document.getElementById('toggleNotifOrderUpdates')?.addEventListener('change', (e) => {
      const val = e.target.checked;
      if (currentUser) {
        db.ref(\`users/\${currentUser.uid}/notificationPreferences/orderUpdates\`).set(val);
      }
      localStorage.setItem('ra_pref_order_updates', String(val));
    });

    document.getElementById('toggleNotifOffers')?.addEventListener('change', (e) => {
      const val = e.target.checked;
      if (currentUser) {
        db.ref(\`users/\${currentUser.uid}/notificationPreferences/offersAndReminders\`).set(val);
      }
      localStorage.setItem('ra_pref_offers', String(val));
    });

    document.getElementById('btnEnableNotificationsPrompt')?.addEventListener('click', async () => {
      if (!('Notification' in window)) return;
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        showToast(I18N[currentLang]?.notifAllowedToast || 'Notifications enabled!');
        await registerFcmToken();
      } else if (perm === 'denied') {
        showToast(I18N[currentLang]?.notifBlockedToast || 'Notifications are blocked in your browser.');
      }
      updateNotificationUI();
    });

    // Post-order prompt handlers inside successModal
    document.getElementById('btnAllowOrderNotifs')?.addEventListener('click', async () => {
      document.getElementById('successNotifPromptBox').style.display = 'none';
      if (!('Notification' in window)) return;
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          showToast(I18N[currentLang]?.notifAllowedToast || 'Notifications enabled!');
          await registerFcmToken();
        } else if (perm === 'denied') {
          showToast(I18N[currentLang]?.notifBlockedToast || 'Notifications blocked in browser.');
        }
      } catch (e) {
        console.warn('Permission request error:', e);
      }
      updateNotificationUI();
    });

    document.getElementById('btnDismissOrderNotifs')?.addEventListener('click', () => {
      document.getElementById('successNotifPromptBox').style.display = 'none';
      localStorage.setItem('ra_notif_prompt_dismissed', String(Date.now()));
    });
`;

if (!content.includes('// NOTIFICATIONS & FCM WEB PUSH (STEPS 2 & 3)')) {
  // Inject right before the closing </script> in index.html
  const endScript = '  </script>\n  </div>';
  content = content.replace(endScript, notifJsImplementation + '\n  </script>\n  </div>');
  console.log('✅ Injected Notification JS logic into index.html');
}

// 7. Update showOrderSuccess to display the prompt with rules
const oldShowOrderSuccessSignature = "function showOrderSuccess(orderId, customer, total, items) {";
const newShowOrderSuccessBody = `function showOrderSuccess(orderId, customer, total, items) {
      try {
        const orderRecord = { id: orderId, total: total, items: items || Object.values(cart || {}), createdAt: new Date().toISOString() };
        localStorage.setItem('ra_last_order', JSON.stringify(orderRecord));
        lastOrder = orderRecord;
        const reorderBtn = document.getElementById('reorderLastBtn');
        if (reorderBtn) reorderBtn.style.display = 'inline-flex';
      } catch (e) {}

      // Handle Notifications Prompt in Success Modal (Step 2)
      const promptBox = document.getElementById('successNotifPromptBox');
      const inAppHint = document.getElementById('successInAppBrowserHint');

      if (isInApp) {
        if (promptBox) promptBox.style.display = 'none';
        if (inAppHint) inAppHint.style.display = 'block';
      } else if ('Notification' in window) {
        if (inAppHint) inAppHint.style.display = 'none';
        const perm = Notification.permission;
        if (perm === 'default') {
          const dismissedAt = parseInt(localStorage.getItem('ra_notif_prompt_dismissed') || '0', 10);
          const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
          if (Date.now() - dismissedAt > fourteenDaysMs) {
            if (promptBox) promptBox.style.display = 'block';
          } else {
            if (promptBox) promptBox.style.display = 'none';
          }
        } else if (perm === 'granted') {
          if (promptBox) promptBox.style.display = 'none';
          registerFcmToken(); // Refresh token on order
        } else {
          if (promptBox) promptBox.style.display = 'none';
        }
      } else {
        if (promptBox) promptBox.style.display = 'none';
        if (inAppHint) inAppHint.style.display = 'none';
      }`;

content = content.replace(
  /function showOrderSuccess\(orderId, customer, total, items\) \{[\s\S]*?const reorderBtn = document\.getElementById\('reorderLastBtn'\);\s*if \(reorderBtn\) reorderBtn\.style\.display = 'inline-flex';\s*\} catch \(e\) \{\}/,
  newShowOrderSuccessBody
);

// 8. Call removeCurrentDeviceToken on user logout
content = content.replace(
  /async function logoutUser\(\) \{/,
  `async function logoutUser() {
      await removeCurrentDeviceToken();`
);

// 9. Call updateNotificationUI on auth state change
content = content.replace(
  /updateAccountStatsUI\(\);/,
  `updateAccountStatsUI();\n        updateNotificationUI();\n        if (user && Notification.permission === 'granted') { registerFcmToken(); }`
);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('🎉 Successfully patched index.html for Push Notifications & Account Controls');
