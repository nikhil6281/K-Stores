const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

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
          badge.innerText = 'Blocked ❌';
          badge.style.background = '#FEE2E2';
          badge.style.color = '#991B1B';
        }
        if (enableBtn) {
          enableBtn.style.display = 'block';
          enableBtn.innerText = '⚠️ Notifications Blocked in Browser';
          enableBtn.disabled = true;
        }
      } else {
        if (badge) {
          badge.innerText = 'Not Enabled';
          badge.style.background = '#FEF3C7';
          badge.style.color = '#92400E';
        }
        if (enableBtn) {
          enableBtn.style.display = 'block';
          enableBtn.innerText = '🔔 Turn on Device Notifications';
          enableBtn.disabled = false;
        }
      }

      // Sync preferences with RTDB
      if (currentUser) {
        db.ref(\`users/\${currentUser.uid}/notificationPreferences\`).once('value', (snap) => {
          const val = snap.val() || {};
          if (orderToggle) orderToggle.checked = val.orderUpdates !== false;
          if (offerToggle) offerToggle.checked = val.offersAndReminders !== false;
        });
      }
    }

    // Toggle listeners for preferences
    document.getElementById('toggleNotifOrderUpdates')?.addEventListener('change', async (e) => {
      if (!currentUser) return;
      const checked = e.target.checked;
      await db.ref(\`users/\${currentUser.uid}/notificationPreferences/orderUpdates\`).set(checked);
      showToast(checked ? 'Order updates turned on' : 'Order updates paused');
    });

    document.getElementById('toggleNotifOffers')?.addEventListener('change', async (e) => {
      if (!currentUser) return;
      const checked = e.target.checked;
      await db.ref(\`users/\${currentUser.uid}/notificationPreferences/offersAndReminders\`).set(checked);
      showToast(checked ? 'Offers & reminders turned on' : 'Offers & reminders paused');
    });

    // Manual enable button
    document.getElementById('btnEnableNotificationsPrompt')?.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        showToast('Notifications are not supported in this browser.');
        return;
      }
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
      const promptBox = document.getElementById('successNotifPromptBox');
      if (promptBox) promptBox.style.display = 'none';
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
      const promptBox = document.getElementById('successNotifPromptBox');
      if (promptBox) promptBox.style.display = 'none';
      localStorage.setItem('ra_notif_prompt_dismissed', String(Date.now()));
    });
`;

// 1. Inject before closing </script>
if (!content.includes('// NOTIFICATIONS & FCM WEB PUSH (STEPS 2 & 3)')) {
  // Use regex matching </script> followed by </div> to handle any CRLF / LF variations
  content = content.replace(/(\s*<\/script>\s*<\/div>\s*<\/body>)/, '\n' + notifJsImplementation + '\n$1');
  console.log('✅ Injected notifJsImplementation into index.html');
}

// 2. Add removeCurrentDeviceToken to accountLogoutBtn listener
if (!content.includes('await removeCurrentDeviceToken();')) {
  content = content.replace(
    /(document\.getElementById\('accountLogoutBtn'\)\?\.addEventListener\('click',\s*async\s*\(\)\s*=>\s*\{[\s\S]*?if\s*\(!confirm\(confirmMsg\)\)\s*return;\s*try\s*\{)/,
    '$1\n        await removeCurrentDeviceToken();'
  );
  console.log('✅ Added removeCurrentDeviceToken to logout');
}

// 3. Add removeCurrentDeviceToken to btnDeleteAccount listener
if (!content.includes('localStorage.removeItem(\'ra_customer_addresses_\' + currentUser.uid);\n          await removeCurrentDeviceToken();')) {
  content = content.replace(
    /(localStorage\.removeItem\('ra_customer_addresses_'\s*\+\s*currentUser\.uid\);)/,
    '$1\n          await removeCurrentDeviceToken();'
  );
  console.log('✅ Added removeCurrentDeviceToken to delete account');
}

fs.writeFileSync(indexPath, content, 'utf8');
console.log('🎉 index.html FCM patch applied!');
