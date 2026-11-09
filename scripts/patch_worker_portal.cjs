const fs = require('fs');

let html = fs.readFileSync('worker.html', 'utf8');
const EOL = html.includes('\r\n') ? '\r\n' : '\n';

function replaceNorm(target, replacement) {
  const normTarget = target.replace(/\r?\n/g, EOL);
  const normRepl = replacement.replace(/\r?\n/g, EOL);
  if (!html.includes(normTarget)) {
    throw new Error('Target not found: ' + target.substring(0, 50));
  }
  html = html.replace(normTarget, normRepl);
}

// 1. Title and Favicon
html = html.replace(/<title>Staff Portal — RA Store Anantapur<\/title>/g, '<title>Sri Sai Staff Portal</title>');
html = html.replace(/<title>[^<]*Staff Portal[^<]*<\/title>/g, '<title>Sri Sai Staff Portal</title>');
html = html.replace(
  /<link rel="icon" href="[^"]+">/g,
  '<link rel="icon" type="image/png" sizes="48x48" href="./assets/logo/favicon-48.png?v=2">'
);

// 2. Header: logo + title
html = html.replace(
  /<span class="brand-title">RA Store<\/span>/g,
  '<img src="./assets/logo/sri-sai-logo.png?v=2" alt="Sri Sai" style="height: 36px; width: auto; object-fit: contain; margin-right: 6px;">\n      <span class="brand-title">Sri Sai</span>'
);

// 3. Login Box Markup: Email OTP + Google, remove phone number login
const oldLoginView = `    <!-- Auth View (Signed Out) -->
    <div id="loginView" style="display: block; max-width: 420px; margin: 40px auto 0; background: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid var(--border); text-align: center;">
      <div style="font-size: 44px; margin-bottom: 12px;">🛵</div>
      <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 6px;" id="tLoginTitle">RA Store Staff Portal</h2>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;" id="tLoginDesc">
        Sign in to pack groceries and coordinate deliveries in Anantapur.
      </p>

      <div id="authStatusBanner" style="display: none; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>

      <!-- Google Sign In Button -->
      <button class="btn btn-primary" id="loginGoogleBtn" style="margin-bottom: 16px;">
        <svg width="18" height="18" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"/></svg>
        Sign In with Google
      </button>

      <!-- Divider -->
      <div style="position: relative; margin: 16px 0; text-align: center;">
        <span style="background: white; padding: 0 10px; font-size: 11px; color: var(--muted); position: relative; z-index: 1;">OR PHONE NUMBER</span>
        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--border);"></div>
      </div>

      <!-- Phone OTP Fallback Container -->
      <div id="phoneLoginWrap">
        <div id="phoneInputStep">
          <div style="display: flex; gap: 6px; margin-bottom: 10px;">
            <span style="display: inline-flex; align-items: center; padding: 8px 10px; background: #F3F4F6; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; font-weight: 600;">+91</span>
            <input type="tel" id="staffPhoneInput" placeholder="10-digit mobile number" maxlength="10" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 14px;">
          </div>
          <div id="recaptchaContainer"></div>
          <button class="btn btn-outline" id="sendOtpBtn" style="font-size: 13px; min-height: 42px;">Send OTP</button>
        </div>

        <div id="otpInputStep" style="display: none; margin-top: 10px;">
          <input type="text" id="staffOtpCode" placeholder="Enter 6-digit OTP" maxlength="6" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 16px; text-align: center; letter-spacing: 4px; margin-bottom: 10px;">
          <button class="btn btn-primary" id="verifyOtpBtn">Verify OTP & Login</button>
        </div>
      </div>

      <!-- Error State Box -->
      <div id="authError" style="color: var(--danger); font-size: 13px; margin-top: 14px; display: none; font-weight: 600; text-align: left; background: #FEE2E2; padding: 10px; border-radius: 8px;"></div>
    </div>`;

const newLoginView = `    <!-- Auth View (Signed Out) -->
    <div id="loginView" style="display: block; max-width: 420px; margin: 40px auto 0; background: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid var(--border); text-align: center;">
      <img src="./assets/logo/sri-sai-logo.png?v=2" alt="Sri Sai" style="height: 52px; margin: 0 auto 12px; display: block; object-fit: contain;">
      <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 6px;" id="tLoginTitle">Sri Sai Staff Portal</h2>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;" id="tLoginDesc">
        Sign in to pack groceries and coordinate deliveries in Anantapur.
      </p>

      <div id="authStatusBanner" style="display: none; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 14px;"></div>

      <!-- Option 1: Continue with Google -->
      <button class="btn btn-primary" id="loginGoogleBtn" style="margin-bottom: 16px; width: 100%; justify-content: center; min-height: 46px; font-size: 14px;">
        <svg width="18" height="18" viewBox="0 0 24 24" style="margin-right: 8px; vertical-align: middle;"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z"/></svg>
        Continue with Google
      </button>

      <!-- Divider -->
      <div style="position: relative; margin: 16px 0; text-align: center;">
        <span style="background: white; padding: 0 10px; font-size: 11px; color: var(--muted); position: relative; z-index: 1;">OR WITH EMAIL OTP</span>
        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--border);"></div>
      </div>

      <!-- Option 2: Email OTP Container -->
      <div id="emailLoginWrap">
        <!-- Step 1: Email Input -->
        <div id="staffEmailStep">
          <input type="email" id="staffEmailInput" placeholder="staff.member@gmail.com" autocomplete="email" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 14px; margin-bottom: 10px;">
          <button class="btn btn-outline" id="sendStaffEmailOtpBtn" style="width: 100%; font-size: 13px; min-height: 42px;">Send 6-Digit Code</button>
        </div>

        <!-- Step 2: Code Verification -->
        <div id="staffOtpStep" style="display: none; margin-top: 10px;">
          <div style="background: #F3F4F6; padding: 8px 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span id="staffSentEmailDisplay" style="color: #374151; font-weight: 600;"></span>
            <button type="button" id="changeStaffEmailBtn" style="background: none; border: none; color: var(--primary); font-size: 11px; font-weight: 700; cursor: pointer; text-decoration: underline;">Change</button>
          </div>
          <input type="text" id="staffEmailOtpInput" placeholder="• • • • • •" maxlength="6" inputmode="numeric" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 18px; text-align: center; letter-spacing: 6px; margin-bottom: 10px;">
          <button class="btn btn-primary" id="verifyStaffEmailOtpBtn" style="width: 100%; min-height: 42px;">Verify & Sign In</button>
          <div style="text-align: center; margin-top: 10px;">
            <button type="button" id="resendStaffOtpBtn" style="background: none; border: none; font-size: 12px; color: var(--muted); cursor: pointer;" disabled>Resend Code <span id="staffResendTimer">(30s)</span></button>
          </div>
        </div>
      </div>

      <!-- Error State Box -->
      <div id="authError" style="color: var(--danger); font-size: 13px; margin-top: 14px; display: none; font-weight: 600; text-align: left; background: #FEE2E2; padding: 10px; border-radius: 8px;"></div>
    </div>`;

replaceNorm(oldLoginView, newLoginView);

// 4. Update Build Label
html = html.replace(/RA-STAFF-2026\.11-v7/g, 'SRI-SAI-STAFF-2026.11-v8');

// 5. Replace JS Authentication & Live Orders Listener
const oldAuthAndListener = `    // Google Sign-In with direct popup
    document.getElementById('loginGoogleBtn').addEventListener('click', () => {
      const errBox = document.getElementById('authError');
      errBox.style.display = 'none';

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      auth.signInWithPopup(provider).catch(err => {
        console.error('Sign-in error:', err);
        updateDebugPanel({ error: err.code + ': ' + err.message });
        if (err.code === 'auth/popup-blocked') {
          errBox.innerText = "⚠️ Popup blocked by browser. Please allow popups for this site, or use the Phone Number sign-in option below.";
        } else if (err.code === 'auth/popup-closed-by-user') {
          errBox.innerText = "Sign-in was closed before completing. Tap the button to try again.";
        } else if (err.code === 'auth/unauthorized-domain') {
          errBox.innerText = "Domain not authorized in Firebase Auth Console. Check authorized domains.";
        } else {
          errBox.innerText = 'Sign-in error: ' + err.message;
        }
        errBox.style.display = 'block';
      });
    });

    // Phone OTP Fallback
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptchaContainer', {
      size: 'invisible'
    });

    document.getElementById('sendOtpBtn').addEventListener('click', async () => {
      const phoneInput = document.getElementById('staffPhoneInput').value.trim();
      const errBox = document.getElementById('authError');
      errBox.style.display = 'none';

      if (!/^[6-9]\\d{9}$/.test(phoneInput)) {
        alert("Please enter a valid 10-digit Indian mobile number.");
        return;
      }

      try {
        const fullPhone = '+91' + phoneInput;
        confirmationResult = await auth.signInWithPhoneNumber(fullPhone, window.recaptchaVerifier);
        document.getElementById('phoneInputStep').style.display = 'none';
        document.getElementById('otpInputStep').style.display = 'block';
        showToast("OTP sent to " + fullPhone);
      } catch (err) {
        console.error('Phone OTP error:', err);
        errBox.innerText = 'OTP Error: ' + err.message;
        errBox.style.display = 'block';
      }
    });

    document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
      const otpCode = document.getElementById('staffOtpCode').value.trim();
      if (!otpCode || otpCode.length !== 6) {
        alert("Please enter the 6-digit verification code.");
        return;
      }
      try {
        await confirmationResult.confirm(otpCode);
        showToast("Phone verified!");
      } catch (err) {
        alert("Invalid OTP code: " + err.message);
      }
    });`;

const newAuthAndListener = `    // Google Sign-In with direct popup
    document.getElementById('loginGoogleBtn').addEventListener('click', () => {
      const errBox = document.getElementById('authError');
      errBox.style.display = 'none';

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      auth.signInWithPopup(provider).catch(err => {
        console.error('Sign-in error:', err);
        updateDebugPanel({ error: err.code + ': ' + err.message });
        if (err.code === 'auth/popup-blocked') {
          errBox.innerText = "⚠️ Popup blocked by browser. Please allow popups for this site, or use the Email OTP sign-in option below.";
        } else if (err.code === 'auth/popup-closed-by-user') {
          errBox.innerText = "Sign-in was closed before completing. Tap the button to try again.";
        } else if (err.code === 'auth/unauthorized-domain') {
          errBox.innerText = "Domain not authorized in Firebase Auth Console. Check authorized domains.";
        } else {
          errBox.innerText = 'Sign-in error: ' + err.message;
        }
        errBox.style.display = 'block';
      });
    });

    // Email OTP Implementation for Staff
    let staffResendInterval = null;
    let staffPendingEmail = '';

    function startStaffResendTimer() {
      let countdown = 30;
      const resendBtn = document.getElementById('resendStaffOtpBtn');
      const timerSpan = document.getElementById('staffResendTimer');
      if (!resendBtn) return;
      resendBtn.disabled = true;
      if (staffResendInterval) clearInterval(staffResendInterval);
      staffResendInterval = setInterval(() => {
        countdown--;
        if (timerSpan) timerSpan.innerText = '(' + countdown + 's)';
        if (countdown <= 0) {
          clearInterval(staffResendInterval);
          resendBtn.disabled = false;
          if (timerSpan) timerSpan.innerText = '';
        }
      }, 1000);
    }

    async function sendStaffEmailOtp(email) {
      const errBox = document.getElementById('authError');
      errBox.style.display = 'none';
      const sendBtn = document.getElementById('sendStaffEmailOtpBtn');
      if (sendBtn) { sendBtn.disabled = true; sendBtn.innerText = 'Sending code...'; }

      try {
        // First try Cloud Functions backend
        const fnUrl = 'https://asia-south1-mana-kirana.cloudfunctions.net/sendEmailOtp';
        const fallbackUrl = (window.APP_CONFIG?.workerApi || 'https://ra-store-api.chowdarynikhil095.workers.dev') + '/api/send-email-otp';
        
        let resp;
        try {
          resp = await fetch(fnUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
          });
        } catch (e) {
          resp = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
          });
        }

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.success) {
          throw new Error(data.error || 'Failed to send verification code');
        }

        staffPendingEmail = email;
        document.getElementById('staffEmailStep').style.display = 'none';
        document.getElementById('staffOtpStep').style.display = 'block';
        document.getElementById('staffSentEmailDisplay').innerText = email;
        startStaffResendTimer();
        showToast('6-digit code sent to ' + email);
      } catch (err) {
        console.error('sendStaffEmailOtp error:', err);
        errBox.innerText = err.message;
        errBox.style.display = 'block';
      } finally {
        if (sendBtn) { sendBtn.disabled = false; sendBtn.innerText = 'Send 6-Digit Code'; }
      }
    }

    document.getElementById('sendStaffEmailOtpBtn')?.addEventListener('click', () => {
      const email = document.getElementById('staffEmailInput').value.trim();
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      sendStaffEmailOtp(email);
    });

    document.getElementById('changeStaffEmailBtn')?.addEventListener('click', () => {
      document.getElementById('staffOtpStep').style.display = 'none';
      document.getElementById('staffEmailStep').style.display = 'block';
      const errBox = document.getElementById('authError');
      if (errBox) errBox.style.display = 'none';
    });

    document.getElementById('resendStaffOtpBtn')?.addEventListener('click', () => {
      if (staffPendingEmail) sendStaffEmailOtp(staffPendingEmail);
    });

    document.getElementById('verifyStaffEmailOtpBtn')?.addEventListener('click', async () => {
      const code = document.getElementById('staffEmailOtpInput').value.trim();
      const errBox = document.getElementById('authError');
      errBox.style.display = 'none';

      if (!code || code.length !== 6) {
        alert('Please enter the 6-digit code.');
        return;
      }

      const verifyBtn = document.getElementById('verifyStaffEmailOtpBtn');
      if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.innerText = 'Verifying...'; }

      try {
        const fnUrl = 'https://asia-south1-mana-kirana.cloudfunctions.net/verifyEmailOtp';
        const fallbackUrl = (window.APP_CONFIG?.workerApi || 'https://ra-store-api.chowdarynikhil095.workers.dev') + '/api/verify-email-otp';

        let resp;
        try {
          resp = await fetch(fnUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: staffPendingEmail, otp: code })
          });
        } catch (e) {
          resp = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: staffPendingEmail, otp: code })
          });
        }

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.success || !data.customToken) {
          throw new Error(data.error || 'Verification failed. Please check the code.');
        }

        await auth.signInWithCustomToken(data.customToken);
        showToast('Email verified! Signing in...');
      } catch (err) {
        console.error('verifyStaffEmailOtp error:', err);
        errBox.innerText = err.message;
        errBox.style.display = 'block';
      } finally {
        if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.innerText = 'Verify & Sign In'; }
      }
    });`;

replaceNorm(oldAuthAndListener, newAuthAndListener);

// 6. Orders Listener with 10s Timeout & Newest First Sorting (Requirements 1 & 2)
const oldOrdersLogic = `    // Realtime Orders Listener
    let isInitialLoad = true;
    function initLiveOrdersListener() {
      db.ref('orders').limitToLast(100).on('value', (snap) => {
        const val = snap.val() || {};
        const oldKeys = Object.keys(ordersCache);
        const newKeys = Object.keys(val);

        if (!isInitialLoad) {
          const freshOrders = newKeys.filter(k => !oldKeys.includes(k));
          if (freshOrders.length > 0) {
            playChime();
          }
        }
        isInitialLoad = false;
        ordersCache = val;
        renderOrders();
      }, (err) => {
        console.error('Order listener error:', err);
        updateDebugPanel({ error: 'RTDB Orders: ' + err.message });
      });
    }

    function renderOrders() {
      const activeList = document.getElementById('activeOrdersList');
      const completedList = document.getElementById('completedOrdersList');
      const t = I18N[currentLang];

      const orders = Object.entries(ordersCache).map(([k, v]) => Object.assign({ pushKey: k }, v));

      // Sort: oldest active first
      orders.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

      const activeOrders = orders.filter(o => {
        if (o.paymentMethod === 'online_razorpay' && o.paymentStatus !== 'paid') return false;
        return o.status === 'placed' || o.status === 'accepted' || o.status === 'packed' || o.status === 'out_for_delivery';
      });

      const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
      completedOrders.reverse();`;

const newOrdersLogic = `    // Realtime Orders Listener with 10s Timeout (Requirement 1)
    let isInitialLoad = true;
    let workerOrdersLoadTimeout = null;

    function getOrderTimestamp(o) {
      if (!o) return 0;
      const raw = o.createdAt || o.created_at || o.timestamp || o.date;
      if (!raw) return 0;
      if (typeof raw === 'number') return raw;
      const parsed = new Date(raw).getTime();
      return isNaN(parsed) ? 0 : parsed;
    }

    function initLiveOrdersListener() {
      const activeList = document.getElementById('activeOrdersList');
      if (workerOrdersLoadTimeout) clearTimeout(workerOrdersLoadTimeout);
      workerOrdersLoadTimeout = setTimeout(() => {
        if (activeList && activeList.innerText.includes('Loading active orders...')) {
          activeList.innerHTML = '<div style="text-align: center; padding: 32px 16px; color: var(--danger); font-size: 14px;"><p style="margin-bottom: 12px; font-weight: 600;">Could not load active orders. Please check connection.</p><button class="btn btn-outline" onclick="location.reload()" style="font-size: 13px; padding: 6px 16px;">Retry</button></div>';
        }
      }, 10000);

      db.ref('orders').limitToLast(100).on('value', (snap) => {
        if (workerOrdersLoadTimeout) clearTimeout(workerOrdersLoadTimeout);
        const val = snap.val() || {};
        const oldKeys = Object.keys(ordersCache);
        const newKeys = Object.keys(val);

        if (!isInitialLoad) {
          const freshOrders = newKeys.filter(k => !oldKeys.includes(k));
          if (freshOrders.length > 0) {
            playChime();
          }
        }
        isInitialLoad = false;
        ordersCache = val;
        renderOrders();
      }, (err) => {
        if (workerOrdersLoadTimeout) clearTimeout(workerOrdersLoadTimeout);
        console.error('Order listener error:', err);
        updateDebugPanel({ error: 'RTDB Orders: ' + err.message });
        if (activeList) {
          activeList.innerHTML = '<div style="text-align: center; padding: 32px 16px; color: var(--danger); font-size: 14px;"><p style="margin-bottom: 12px; font-weight: 600;">Could not load orders: ' + escapeHtml(err.message || 'Permission denied') + '</p><button class="btn btn-outline" onclick="location.reload()" style="font-size: 13px; padding: 6px 16px;">Retry</button></div>';
        }
      });
    }

    function renderOrders() {
      const activeList = document.getElementById('activeOrdersList');
      const completedList = document.getElementById('completedOrdersList');
      const t = I18N[currentLang];

      const orders = Object.entries(ordersCache).map(([k, v]) => Object.assign({ pushKey: k }, v));

      // Strictly sorted newest first by real created time (Requirement 2)
      orders.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));

      const activeOrders = orders.filter(o => {
        if (o.paymentMethod === 'online_razorpay' && o.paymentStatus !== 'paid') return false;
        return o.status === 'placed' || o.status === 'accepted' || o.status === 'packed' || o.status === 'out_for_delivery';
      });

      const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');
      completedOrders.sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));`;

replaceNorm(oldOrdersLogic, newOrdersLogic);

// 7. General brand replacements
html = html.replace(/RA Store/g, 'Sri Sai');
html = html.replace(/RA Stores/g, 'Sri Sai');
html = html.replace(/RA-STAFF/g, 'SRI-SAI-STAFF');

fs.writeFileSync('worker.html', html, 'utf8');
console.log('worker.html successfully patched!');

