const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const EOL = html.includes('\r\n') ? '\r\n' : '\n';

function replaceNorm(target, replacement, label) {
  const normTarget = target.replace(/\r?\n/g, EOL);
  const normRepl = replacement.replace(/\r?\n/g, EOL);
  if (!html.includes(normTarget)) {
    console.error('❌ Failed target for:', label);
    console.error('Target sample:', normTarget.slice(0, 150));
    throw new Error('Target not found: ' + label);
  }
  html = html.replace(normTarget, normRepl);
  console.log('✅ Applied:', label);
}

// 1. Title & Meta
replaceNorm(
  `<title>RA Store — Fresh Groceries Delivered in Anantapur</title>`,
  `<title>Sri Sai — Fresh Groceries Delivered in Anantapur</title>`,
  'Title'
);

replaceNorm(
  `  <!-- PWA Manifest -->
  <link rel="manifest" href="./manifest.json">
  <link rel="apple-touch-icon" href="./icon-192.png">
  <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="./icon-512.png">`,
  `  <!-- PWA Manifest & Sri Sai Icons -->
  <link rel="manifest" href="./manifest.json">
  <link rel="icon" type="image/png" sizes="48x48" href="./assets/logo/favicon-48.png?v=2">
  <link rel="apple-touch-icon" sizes="180x180" href="./assets/logo/apple-touch-icon-180.png?v=2">
  <link rel="icon" type="image/png" sizes="192x192" href="./assets/logo/app-icon-192.png?v=2">
  <link rel="icon" type="image/png" sizes="512x512" href="./assets/logo/app-icon-512.png?v=2">`,
  'Icons and Manifest'
);

replaceNorm(
  `  <meta property="og:title" content="RA Store — Fresh Groceries Delivered in Anantapur">`,
  `  <meta property="og:title" content="Sri Sai — Fresh Groceries Delivered in Anantapur">`,
  'OG Title'
);

// 2. Schema JSON-LD
replaceNorm(
  `    "name": "RA Store",
    "alternateName": ["Ananthapur RA Store", "Anantapuramu RA Store", "RA General Store"],`,
  `    "name": "Sri Sai",
    "alternateName": ["Sri Sai Store", "Sri Sai General Store", "Sri Sai Anantapur"],`,
  'Schema JSON-LD'
);

// 3. Bottom Bar CSS
const oldBnavCss = `    /* Persistent Bottom Navigation: Keep visible on Cart & Orders, hide only floating cart bar & during checkout/signin */
    .mobile-bottom-nav {
      z-index: 450 !important;
    }
    body.overlay-open .bottom-bar,
    body.signin-open .bottom-bar,
    body.signin-open .mobile-bottom-nav,
    body.checkout-open .mobile-bottom-nav {
      transform: translateY(calc(100% + env(safe-area-inset-bottom, 0px) + 20px)) !important;
      pointer-events: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      transition: transform 220ms ease, opacity 220ms ease, visibility 0s linear 0.22s !important;
    }

    @media (min-width: 481px) {
      body.overlay-open .bottom-bar,
      body.signin-open .bottom-bar,
      body.signin-open .mobile-bottom-nav,
      body.checkout-open .mobile-bottom-nav {
        transform: translate(-50%, calc(100% + env(safe-area-inset-bottom, 0px) + 20px)) !important;
        pointer-events: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        transition: transform 220ms ease, opacity 220ms ease, visibility 0s linear 0.22s !important;
      }
    }`;

const newBnavCss = `    /* Requirement 3: Bottom Bar Pop-Out (Hide) & Pop-In (Show) with single state variable */
    .mobile-bottom-nav,
    .bottom-bar,
    .cart-bar-sticky {
      z-index: 450 !important;
      transition: transform 260ms cubic-bezier(0.4, 0, 0.2, 1), opacity 240ms ease !important;
      will-change: transform, opacity;
    }

    body.bnav-hidden .mobile-bottom-nav,
    body.bnav-hidden .bottom-bar,
    body.bnav-hidden .cart-bar-sticky,
    body.overlay-open .mobile-bottom-nav,
    body.overlay-open .bottom-bar,
    body.overlay-open .cart-bar-sticky {
      transform: translateY(calc(100% + env(safe-area-inset-bottom, 0px) + 24px)) !important;
      pointer-events: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }

    @media (min-width: 481px) {
      body.bnav-hidden .mobile-bottom-nav,
      body.bnav-hidden .bottom-bar,
      body.bnav-hidden .cart-bar-sticky,
      body.overlay-open .mobile-bottom-nav,
      body.overlay-open .bottom-bar,
      body.overlay-open .cart-bar-sticky {
        transform: translate(-50%, calc(100% + env(safe-area-inset-bottom, 0px) + 24px)) !important;
        pointer-events: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    }`;

replaceNorm(oldBnavCss, newBnavCss, 'Bottom Bar CSS');

// 4. Navbar Brand
replaceNorm(
  `  <header class="navbar">
    <div class="brand">
      <span class="brand-title" id="navbarBrandTitle">RA Store</span> <span class="brand-badge">ANANTAPUR</span>
    </div>`,
  `  <header class="navbar">
    <div class="brand" style="display: flex; align-items: center; gap: 8px;">
      <img src="./assets/logo/sri-sai-logo.png?v=2" alt="Sri Sai" style="height: 36px; width: auto; object-fit: contain;">
      <span class="brand-title" id="navbarBrandTitle">Sri Sai</span> <span class="brand-badge">ANANTAPUR</span>
    </div>`,
  'Navbar Brand'
);

// 5. Login Modal
const oldLoginModal = `  <!-- Phone OTP & Google Login Modal -->
  <div class="modal-overlay" id="loginModal" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
    <div class="modal">
      <div class="drawer-drag-handle"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <h3 style="font-size: 16px; font-weight: 700;" id="loginModalTitle">Sign In to RA Store</h3>
        <button class="modal-close-btn" data-modal="loginModal" aria-label="Close login modal" style="background: none; border: none; font-size: 18px; cursor: pointer; min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;">✕</button>
      </div>

      <!-- Step 1: Mobile Number Input -->
      <div id="phoneInputStep">
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 12px;" id="tPhoneLoginSub">Enter your 10-digit mobile number for fast grocery delivery and order tracking in Anantapur.</p>
        
        <div class="phone-input-group">
          <span class="phone-prefix">🇮🇳 +91</span>
          <input type="tel" id="loginPhoneInput" class="phone-input-field" placeholder="10-digit mobile number" pattern="[0-9]{10}" inputmode="numeric" maxlength="10" autocomplete="tel-national">
        </div>

        <button type="button" id="sendOtpBtn" class="btn btn-primary" style="width: 100%; min-height: 46px; font-size: 14px; margin-top: 10px;">
          Send OTP via SMS
        </button>
      </div>

      <!-- Step 2: OTP Verification Input -->
      <div id="otpInputStep" style="display: none;">
        <div style="background: #F3F4F6; padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px;">
            <span style="color: var(--muted);" id="tOtpSentTo">OTP sent to: </span>
            <strong id="otpPhoneDisplay">+91</strong>
          </div>
          <button type="button" id="changePhoneBtn" style="background: none; border: none; color: var(--primary); font-size: 11px; font-weight: 700; cursor: pointer; text-decoration: underline;">Change</button>
        </div>

        <div class="form-group" style="text-align: center;">
          <label for="otpCodeInput" style="font-size: 12px; color: var(--muted); margin-bottom: 6px; display: block;" id="tEnterOtpLabel">Enter 6-Digit Verification Code</label>
          <input type="tel" id="otpCodeInput" class="otp-input-field" placeholder="• • • • • •" pattern="[0-9]{6}" inputmode="numeric" maxlength="6" autocomplete="one-time-code">
        </div>

        <button type="button" id="verifyOtpBtn" class="btn btn-primary" style="width: 100%; min-height: 46px; font-size: 14px; margin-top: 8px;">
          Verify & Sign In
        </button>

        <div style="text-align: center; margin-top: 12px;">
          <button type="button" id="resendOtpBtn" style="background: none; border: none; font-size: 12px; color: var(--muted); cursor: pointer;" disabled>
            Resend OTP <span id="resendTimer">(30s)</span>
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="auth-divider">
        <span id="tOrDivider">OR</span>
      </div>

      <!-- Google Sign In Secondary Option -->
      <button type="button" class="btn btn-outline" id="loginGoogleSecondaryBtn" style="width: 100%; min-height: 44px; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
        <span id="tSignInWithGoogle">Sign in with Google</span>
      </button>

      <!-- Invisible reCAPTCHA container -->
      <div id="recaptcha-container"></div>
    </div>
  </div>`;

const newLoginModal = `  <!-- Email OTP & Google Login Modal -->
  <div class="modal-overlay" id="loginModal" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
    <div class="modal" style="max-width: 400px;">
      <div class="drawer-drag-handle"></div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 16px; font-weight: 700;" id="loginModalTitle">Sign In to Sri Sai</h3>
        <button class="modal-close-btn" data-modal="loginModal" aria-label="Close login modal" style="background: none; border: none; font-size: 18px; cursor: pointer; min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;">✕</button>
      </div>

      <img src="./assets/logo/sri-sai-logo.png?v=2" alt="Sri Sai" style="height: 48px; margin: 0 auto 10px; display: block; object-fit: contain;">

      <!-- Option 1: Continue with Google -->
      <button type="button" class="btn btn-outline" id="loginGoogleBtn" style="width: 100%; min-height: 46px; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 8px; font-weight: 600; border: 1.5px solid var(--border); background: #FFFFFF; margin-bottom: 14px;">
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
        <span id="tSignInWithGoogle">Continue with Google</span>
      </button>

      <!-- Divider -->
      <div style="position: relative; margin: 14px 0; text-align: center;">
        <span style="background: white; padding: 0 10px; font-size: 11px; color: var(--muted); position: relative; z-index: 1;">OR WITH EMAIL OTP</span>
        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: var(--border);"></div>
      </div>

      <!-- Option 2: Email OTP Input Container -->
      <div id="emailLoginWrap">
        <!-- Step 1: Email Input -->
        <div id="emailInputStep">
          <p style="font-size: 12px; color: var(--muted); margin-bottom: 10px;" id="tEmailLoginSub">Enter your email address to receive a 6-digit verification code.</p>
          <input type="email" id="loginEmailInput" placeholder="name@example.com" autocomplete="email" inputmode="email" style="width: 100%; border: 1.5px solid var(--border); border-radius: 8px; padding: 12px 14px; font-size: 15px; margin-bottom: 10px;">
          <button type="button" id="sendEmailOtpBtn" class="btn btn-primary" style="width: 100%; min-height: 46px; font-size: 14px; border-radius: 8px;">
            Send 6-Digit Code
          </button>
        </div>

        <!-- Step 2: 6-Digit Verification Code -->
        <div id="emailOtpStep" style="display: none;">
          <div style="background: #F3F4F6; padding: 8px 12px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px;">
              <span style="color: var(--muted);">Code sent to: </span>
              <strong id="otpEmailDisplay" style="color: #111827;"></strong>
            </div>
            <button type="button" id="changeEmailBtn" style="background: none; border: none; color: var(--primary); font-size: 11px; font-weight: 700; cursor: pointer; text-decoration: underline;">Change</button>
          </div>

          <div class="form-group" style="text-align: center;">
            <label for="emailOtpInput" style="font-size: 12px; color: var(--muted); margin-bottom: 6px; display: block;">Enter 6-Digit Verification Code</label>
            <input type="tel" id="emailOtpInput" class="otp-input-field" placeholder="• • • • • •" pattern="[0-9]{6}" inputmode="numeric" maxlength="6" autocomplete="one-time-code" style="width: 100%; text-align: center; letter-spacing: 6px; font-size: 20px; font-weight: 700; padding: 10px; border-radius: 8px; border: 1.5px solid var(--border);">
          </div>

          <button type="button" id="verifyEmailOtpBtn" class="btn btn-primary" style="width: 100%; min-height: 46px; font-size: 14px; margin-top: 8px; border-radius: 8px;">
            Verify & Sign In
          </button>

          <div style="text-align: center; margin-top: 12px;">
            <button type="button" id="resendEmailOtpBtn" style="background: none; border: none; font-size: 12px; color: var(--muted); cursor: pointer;" disabled>
              Resend Code <span id="emailResendTimer">(30s)</span>
            </button>
          </div>
        </div>
      </div>

      <div id="loginErrorBox" style="display: none; margin-top: 12px; padding: 10px; background: #FEE2E2; color: #DC2626; border-radius: 6px; font-size: 12px; text-align: left; font-weight: 600;"></div>
    </div>
  </div>`;

replaceNorm(oldLoginModal, newLoginModal, 'Login Modal Markup');

// 6. Version and Footer
replaceNorm(
  `<div><strong>RA Store</strong> • <span id="footerAddressText">Sri Sai General Store, Old Town, Anantapur, Andhra Pradesh</span></div>`,
  `<div><strong>Sri Sai</strong> • <span id="footerAddressText">Old Town, Anantapur, Andhra Pradesh</span></div>`,
  'Footer Store Address'
);

replaceNorm(
  `<div class="account-version" id="tAccountVersion">RA Store v2.1.2 • Anantapur, Andhra Pradesh</div>`,
  `<div class="account-version" id="tAccountVersion">Sri Sai v2.2.0 • Anantapur, Andhra Pradesh</div>`,
  'Account Version Text'
);

replaceNorm(
  `const APP_VERSION = "v2.1.2";`,
  `const APP_VERSION = "v2.2.0";`,
  'APP_VERSION Constant'
);

// 7. Dynamic Brand Title Language Switcher
replaceNorm(
  `      const brandTitleEl = document.getElementById('navbarBrandTitle');
      if (brandTitleEl) brandTitleEl.innerText = (lang === 'te' ? 'RA స్టోర్' : 'RA Store');`,
  `      const brandTitleEl = document.getElementById('navbarBrandTitle');
      if (brandTitleEl) brandTitleEl.innerText = (lang === 'te' ? (window.APP_CONFIG?.storeNameTelugu || 'శ్రీ సాయి') : (window.APP_CONFIG?.storeName || 'Sri Sai'));`,
  'Brand Title Language Switch'
);

// 8. OpenOrdersModal & 10s Timeout & Error Callback
const oldOrdersFn = `    // Phase 3: Order History & Status Timeline Stepper
    function openOrdersModal() {
      if (!currentUser) {
        pendingOrdersAfterLogin = true;
        openLoginModal();
        return;
      }
      openModal('ordersModal');
      
      if (ordersRef) ordersRef.off();
      ordersRef = db.ref('orders').orderByChild('uid').equalTo(currentUser.uid);
      
      ordersRef.on('value', snap => {
        const list = document.getElementById('customerOrdersList');
        const orders = snap.val();
        if (!orders) {
          list.innerHTML = "<p style='color: var(--muted); padding: 15px;'>No orders found.</p>";
          return;
        }`;

const newOrdersFn = `    // Phase 3: Order History & Status Timeline Stepper with 10s timeout, error callback & signed-out view (Requirement 1 & 2)
    let customerOrdersLoadTimeout = null;

    function getOrderTimestamp(o) {
      if (!o) return 0;
      const raw = o.createdAt || o.created_at || o.timestamp || o.date;
      if (!raw) return 0;
      if (typeof raw === 'number') return raw;
      const parsed = new Date(raw).getTime();
      return isNaN(parsed) ? 0 : parsed;
    }

    function openOrdersModal() {
      openModal('ordersModal');
      setActiveNavTab('orders');

      const list = document.getElementById('customerOrdersList');
      if (!currentUser) {
        if (list) {
          list.innerHTML = \`
            <div style="text-align: center; padding: 36px 16px;">
              <div style="font-size: 44px; margin-bottom: 12px;">🛍️</div>
              <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Sign in to see your orders</h4>
              <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px; line-height: 1.5;">Please sign in with your email or Google account to track your orders in real time.</p>
              <button type="button" class="btn btn-primary" id="ordersSignInPromptBtn" style="padding: 10px 24px; font-size: 14px; border-radius: 8px;">Sign In</button>
            </div>\`;
          document.getElementById('ordersSignInPromptBtn')?.addEventListener('click', () => {
            pendingOrdersAfterLogin = true;
            openLoginModal();
          });
        }
        return;
      }

      if (list) {
        list.innerHTML = "<div style='text-align: center; padding: 30px 16px;'><p style='color: var(--muted); font-size: 14px;'>Loading orders...</p></div>";
      }

      if (customerOrdersLoadTimeout) clearTimeout(customerOrdersLoadTimeout);
      customerOrdersLoadTimeout = setTimeout(() => {
        const el = document.getElementById('customerOrdersList');
        if (el && el.innerHTML.includes('Loading orders...')) {
          el.innerHTML = \`
            <div style="text-align: center; padding: 32px 16px;">
              <p style="color: var(--danger); font-size: 14px; margin-bottom: 12px; font-weight: 600;">Could not load orders. Please check your connection.</p>
              <button type="button" class="btn btn-outline" id="retryOrdersBtn" style="padding: 8px 18px; font-size: 13px;">Retry</button>
            </div>\`;
          document.getElementById('retryOrdersBtn')?.addEventListener('click', () => openOrdersModal());
        }
      }, 10000);

      if (ordersRef) ordersRef.off();
      ordersRef = db.ref('orders').orderByChild('uid').equalTo(currentUser.uid);

      ordersRef.on('value', snap => {
        if (customerOrdersLoadTimeout) clearTimeout(customerOrdersLoadTimeout);
        const list = document.getElementById('customerOrdersList');
        const orders = snap.val();
        if (!orders || Object.keys(orders).length === 0) {
          list.innerHTML = "<div style='text-align: center; padding: 36px 16px;'><div style='font-size: 42px; margin-bottom: 12px;'>📦</div><p style='color: var(--muted); font-size: 14px; font-weight: 600;'>No orders yet</p><p style='font-size: 12px; color: var(--muted); margin-top: 4px;'>Your placed orders will appear here.</p></div>";
          return;
        }`;

replaceNorm(oldOrdersFn, newOrdersFn, 'openOrdersModal Timeout & View');

// 9. Orders sorting newest first inside listener
const oldOrdersSort = `        // 1. Sort all orders strictly newest first -> oldest by creation timestamp (STEP 1.1)
        const orderEntries = Object.entries(orders);
        orderEntries.sort((a, b) => {
          const timeA = a[1].createdAt ? new Date(a[1].createdAt).getTime() : 0;
          const timeB = b[1].createdAt ? new Date(b[1].createdAt).getTime() : 0;
          return timeB - timeA;
        });`;

const newOrdersSort = `        // 1. Sort all orders strictly newest first -> oldest by creation timestamp (Requirement 2)
        const orderEntries = Object.entries(orders);
        orderEntries.sort((a, b) => getOrderTimestamp(b[1]) - getOrderTimestamp(a[1]));`;

replaceNorm(oldOrdersSort, newOrdersSort, 'Order Entries Newest First Sort');

// 10. Orders listener error callback
const oldOrdersEnd = `        list.innerHTML = '';
        list.appendChild(frag);
      });
    }`;

const newOrdersEnd = `        list.innerHTML = '';
        list.appendChild(frag);
      }, (err) => {
        if (customerOrdersLoadTimeout) clearTimeout(customerOrdersLoadTimeout);
        console.error('Customer orders listener error:', err);
        const list = document.getElementById('customerOrdersList');
        if (list) {
          list.innerHTML = \`
            <div style="text-align: center; padding: 32px 16px;">
              <p style="color: var(--danger); font-size: 14px; margin-bottom: 12px; font-weight: 600;">Could not load orders: \${escapeHtml(err.message || 'Permission denied')}</p>
              <button type="button" class="btn btn-outline" id="retryOrdersBtn" style="padding: 8px 18px; font-size: 13px;">Retry</button>
            </div>\`;
          document.getElementById('retryOrdersBtn')?.addEventListener('click', () => openOrdersModal());
        }
      });
    }`;

replaceNorm(oldOrdersEnd, newOrdersEnd, 'ordersRef error callback');

// 11. Bottom nav bar Orders click listener
replaceNorm(
  `    document.getElementById('navOrders').addEventListener('click', () => {
      if (!currentUser) {
        pendingOrdersAfterLogin = true;
        openModal('loginModal');
      } else {
        openOrdersModal();
      }
    });`,
  `    document.getElementById('navOrders').addEventListener('click', () => {
      openOrdersModal();
    });`,
  'navOrders click listener'
);

// 12. Replace Phone Auth JS with Email OTP + Google Login
const oldPhoneAuthJs = `    function sanitizeIndianPhone(raw) {
      if (!raw) return null;
      const digits = String(raw).replace(/\\D/g, '');
      if (digits.length === 10 && /^[6-9]/.test(digits)) {
        return '+91' + digits;
      }
      if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
        return '+' + digits;
      }
      return null;
    }

    function getRecaptchaVerifier() {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
          callback: function () {
            // reCAPTCHA solved
          },
          'expired-callback': function () {
            if (window.recaptchaVerifier) {
              try { window.recaptchaVerifier.clear(); } catch(e){}
              window.recaptchaVerifier = null;
            }
          }
        });
      }
      return window.recaptchaVerifier;
    }

    async function sendPhoneOtp(rawPhone) {
      const formattedPhone = sanitizeIndianPhone(rawPhone);
      if (!formattedPhone) {
        showToast("Please enter a valid 10-digit mobile number");
        return;
      }

      const sendBtn = document.getElementById('sendOtpBtn');
      sendBtn.disabled = true;
      sendBtn.innerText = I18N[currentLang].sendingOtp;

      try {
        const verifier = getRecaptchaVerifier();
        phoneConfirmationResult = await auth.signInWithPhoneNumber(formattedPhone, verifier);
        
        document.getElementById('phoneInputStep').style.display = 'none';
        document.getElementById('otpInputStep').style.display = 'block';
        document.getElementById('otpPhoneDisplay').innerText = formattedPhone;
        document.getElementById('otpCodeInput').value = '';
        document.getElementById('otpCodeInput').focus();
        
        startResendCountdown();
        showToast("OTP sent to " + formattedPhone);
      } catch (err) {
        console.error("Phone Auth Error:", err);
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch(e){}
          window.recaptchaVerifier = null;
        }
        alert("Could not send OTP: " + (err.message || "Please check number and try again."));
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerText = I18N[currentLang].sendOtpBtn;
      }
    }

    async function verifyPhoneOtp(code) {
      if (!phoneConfirmationResult) {
        showToast("Session expired. Please request OTP again.");
        return;
      }
      const cleanCode = (code || '').trim();
      if (cleanCode.length !== 6) {
        showToast("Please enter the 6-digit OTP code");
        return;
      }

      const verifyBtn = document.getElementById('verifyOtpBtn');
      verifyBtn.disabled = true;
      verifyBtn.innerText = I18N[currentLang].verifyingOtp;

      try {
        await phoneConfirmationResult.confirm(cleanCode);
        showToast("Signed in successfully!");
        closeModal('loginModal');
      } catch (err) {
        console.error("OTP Verification Error:", err);
        alert("Invalid OTP code: " + (err.message || "Please check the code and try again."));
      } finally {
        verifyBtn.disabled = false;
        verifyBtn.innerText = I18N[currentLang].verifyOtpBtn;
      }
    }

    function startResendCountdown() {
      let seconds = 30;
      const resendBtn = document.getElementById('resendOtpBtn');
      const timerSpan = document.getElementById('resendTimer');
      resendBtn.disabled = true;
      timerSpan.innerText = \`(\${seconds}s)\`;
      
      if (resendTimerInterval) clearInterval(resendTimerInterval);
      resendTimerInterval = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(resendTimerInterval);
          resendBtn.disabled = false;
          timerSpan.innerText = '';
        } else {
          timerSpan.innerText = \`(\${seconds}s)\`;
        }
      }, 1000);
    }

    document.getElementById('sendOtpBtn').addEventListener('click', () => {
      const phone = document.getElementById('loginPhoneInput').value.trim();
      sendPhoneOtp(phone);
    });

    document.getElementById('loginPhoneInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('sendOtpBtn').click();
      }
    });

    document.getElementById('verifyOtpBtn').addEventListener('click', () => {
      const code = document.getElementById('otpCodeInput').value.trim();
      verifyPhoneOtp(code);
    });

    document.getElementById('otpCodeInput').addEventListener('input', (e) => {
      if (e.target.value.length === 6) {
        verifyPhoneOtp(e.target.value);
      }
    });

    document.getElementById('otpCodeInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('verifyOtpBtn').click();
      }
    });

    document.getElementById('resendOtpBtn').addEventListener('click', () => {
      const phone = document.getElementById('loginPhoneInput').value.trim();
      sendPhoneOtp(phone);
    });

    document.getElementById('changePhoneBtn').addEventListener('click', () => {
      if (resendTimerInterval) clearInterval(resendTimerInterval);
      document.getElementById('otpInputStep').style.display = 'none';
      document.getElementById('phoneInputStep').style.display = 'block';
      document.getElementById('loginPhoneInput').focus();
    });

    function openLoginModal() {
      document.getElementById('phoneInputStep').style.display = 'block';
      document.getElementById('otpInputStep').style.display = 'none';
      document.getElementById('loginPhoneInput').value = '';
      document.getElementById('otpCodeInput').value = '';
      if (resendTimerInterval) clearInterval(resendTimerInterval);
      openModal('loginModal');
      setTimeout(() => {
        document.getElementById('loginPhoneInput').focus();
      }, 200);
    }`;

const newEmailAuthJs = `    // Email OTP Authentication (Requirement 6)
    let emailResendInterval = null;
    let pendingLoginEmail = '';

    function startEmailResendCountdown() {
      let seconds = 30;
      const resendBtn = document.getElementById('resendEmailOtpBtn');
      const timerSpan = document.getElementById('emailResendTimer');
      if (!resendBtn) return;
      resendBtn.disabled = true;
      if (timerSpan) timerSpan.innerText = \`(\${seconds}s)\`;
      
      if (emailResendInterval) clearInterval(emailResendInterval);
      emailResendInterval = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(emailResendInterval);
          resendBtn.disabled = false;
          if (timerSpan) timerSpan.innerText = '';
        } else {
          if (timerSpan) timerSpan.innerText = \`(\${seconds}s)\`;
        }
      }, 1000);
    }

    async function sendCustomerEmailOtp(email) {
      const errBox = document.getElementById('loginErrorBox');
      if (errBox) errBox.style.display = 'none';
      const sendBtn = document.getElementById('sendEmailOtpBtn');
      if (sendBtn) { sendBtn.disabled = true; sendBtn.innerText = 'Sending 6-digit code...'; }

      try {
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
          throw new Error(data.error || 'Failed to send verification code. Please check email address.');
        }

        pendingLoginEmail = email;
        document.getElementById('emailInputStep').style.display = 'none';
        document.getElementById('emailOtpStep').style.display = 'block';
        document.getElementById('otpEmailDisplay').innerText = email;
        const otpInput = document.getElementById('emailOtpInput');
        if (otpInput) { otpInput.value = ''; otpInput.focus(); }
        startEmailResendCountdown();
        showToast('6-digit code sent to ' + email);
      } catch (err) {
        console.error('sendCustomerEmailOtp error:', err);
        if (errBox) {
          errBox.innerText = err.message;
          errBox.style.display = 'block';
        }
      } finally {
        if (sendBtn) { sendBtn.disabled = false; sendBtn.innerText = 'Send 6-Digit Code'; }
      }
    }

    async function verifyCustomerEmailOtp(code) {
      const errBox = document.getElementById('loginErrorBox');
      if (errBox) errBox.style.display = 'none';
      const cleanCode = (code || '').trim();

      if (cleanCode.length !== 6) {
        if (errBox) {
          errBox.innerText = 'Please enter the 6-digit verification code.';
          errBox.style.display = 'block';
        }
        return;
      }

      const verifyBtn = document.getElementById('verifyEmailOtpBtn');
      if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.innerText = 'Verifying & Signing In...'; }

      try {
        const fnUrl = 'https://asia-south1-mana-kirana.cloudfunctions.net/verifyEmailOtp';
        const fallbackUrl = (window.APP_CONFIG?.workerApi || 'https://ra-store-api.chowdarynikhil095.workers.dev') + '/api/verify-email-otp';

        let resp;
        try {
          resp = await fetch(fnUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: pendingLoginEmail, otp: cleanCode })
          });
        } catch (e) {
          resp = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: pendingLoginEmail, otp: cleanCode })
          });
        }

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || !data.success || !data.customToken) {
          throw new Error(data.error || 'Invalid verification code. Please check and try again.');
        }

        await auth.signInWithCustomToken(data.customToken);
        showToast('Signed in successfully!');
        closeModal('loginModal');

        if (pendingCheckoutAfterLogin) {
          pendingCheckoutAfterLogin = false;
          openCheckout();
        } else if (pendingOrdersAfterLogin) {
          pendingOrdersAfterLogin = false;
          openOrdersModal();
        }
      } catch (err) {
        console.error('verifyCustomerEmailOtp error:', err);
        if (errBox) {
          errBox.innerText = err.message;
          errBox.style.display = 'block';
        }
      } finally {
        if (verifyBtn) { verifyBtn.disabled = false; verifyBtn.innerText = 'Verify & Sign In'; }
      }
    }

    document.getElementById('sendEmailOtpBtn')?.addEventListener('click', () => {
      const email = document.getElementById('loginEmailInput').value.trim();
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      sendCustomerEmailOtp(email);
    });

    document.getElementById('loginEmailInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('sendEmailOtpBtn')?.click();
      }
    });

    document.getElementById('verifyEmailOtpBtn')?.addEventListener('click', () => {
      const code = document.getElementById('emailOtpInput')?.value.trim();
      verifyCustomerEmailOtp(code);
    });

    document.getElementById('emailOtpInput')?.addEventListener('input', (e) => {
      if (e.target.value.length === 6) {
        verifyCustomerEmailOtp(e.target.value);
      }
    });

    document.getElementById('emailOtpInput')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('verifyEmailOtpBtn')?.click();
      }
    });

    document.getElementById('resendEmailOtpBtn')?.addEventListener('click', () => {
      if (pendingLoginEmail) sendCustomerEmailOtp(pendingLoginEmail);
    });

    document.getElementById('changeEmailBtn')?.addEventListener('click', () => {
      if (emailResendInterval) clearInterval(emailResendInterval);
      document.getElementById('emailOtpStep').style.display = 'none';
      document.getElementById('emailInputStep').style.display = 'block';
      const errBox = document.getElementById('loginErrorBox');
      if (errBox) errBox.style.display = 'none';
      document.getElementById('loginEmailInput')?.focus();
    });

    function openLoginModal() {
      document.getElementById('emailInputStep').style.display = 'block';
      document.getElementById('emailOtpStep').style.display = 'none';
      const emailInput = document.getElementById('loginEmailInput');
      if (emailInput) emailInput.value = '';
      const otpInput = document.getElementById('emailOtpInput');
      if (otpInput) otpInput.value = '';
      const errBox = document.getElementById('loginErrorBox');
      if (errBox) errBox.style.display = 'none';
      if (emailResendInterval) clearInterval(emailResendInterval);
      openModal('loginModal');
      setTimeout(() => {
        emailInput?.focus();
      }, 200);
    }`;

replaceNorm(oldPhoneAuthJs, newEmailAuthJs, 'Email Auth JS Handlers');

// 13. Wire Google button
replaceNorm(
  `document.getElementById('loginGoogleSecondaryBtn')?.addEventListener('click', loginGoogle);`,
  `document.getElementById('loginGoogleBtn')?.addEventListener('click', loginGoogle);`,
  'Google Sign In Event Listener'
);

// 14. Bottom Bar Pop-Out / Pop-In JS Driver (Requirement 3)
const oldSyncBottomBarFn = `    function syncBottomBar() {
      if (syncBottomBarRaf) {
        cancelAnimationFrame(syncBottomBarRaf);
      }
      syncBottomBarRaf = requestAnimationFrame(() => {
        syncBottomBarRaf = null;
        const overlays = document.querySelectorAll(
          '#cartDrawerModal, #checkoutModal, #addressModal, #successModal, #ordersModal, #loginModal, #imageZoomModal, .modal-overlay'
        );
        let anyOpen = false;
        for (let i = 0; i < overlays.length; i++) {
          if (isOverlayOpen(overlays[i])) {
            anyOpen = true;
            break;
          }
        }
        if (anyOpen) {
          document.body.classList.add('overlay-open');
        } else {
          document.body.classList.remove('overlay-open');
        }
        const loginEl = document.getElementById('loginModal');
        const isLoginOpen = loginEl && isOverlayOpen(loginEl);
        if (isLoginOpen) {
          document.body.classList.add('signin-open');
        } else {
          document.body.classList.remove('signin-open');
        }
      });
    }`;

const newSyncBottomBarFn = `    let isBottomNavHidden = false;

    function syncUnderlyingTab() {
      const accountView = document.getElementById('accountView');
      const categoriesView = document.getElementById('categoriesView');
      if (accountView && accountView.style.display === 'block') {
        setActiveNavTab('account', false);
      } else if (categoriesView && categoriesView.style.display === 'block') {
        setActiveNavTab('categories', false);
      } else {
        setActiveNavTab('home', false);
      }
    }

    function syncBottomBar() {
      if (syncBottomBarRaf) {
        cancelAnimationFrame(syncBottomBarRaf);
      }
      syncBottomBarRaf = requestAnimationFrame(() => {
        syncBottomBarRaf = null;
        const cartModal = document.getElementById('cartDrawerModal');
        const ordersModal = document.getElementById('ordersModal');
        const checkoutModal = document.getElementById('checkoutModal');
        const loginModal = document.getElementById('loginModal');
        const successModal = document.getElementById('successModal');
        const addressModal = document.getElementById('addressModal');

        const isCart = isOverlayOpen(cartModal);
        const isOrders = isOverlayOpen(ordersModal);
        const isCheckout = isOverlayOpen(checkoutModal);
        const isLogin = isOverlayOpen(loginModal);
        const isSuccess = isOverlayOpen(successModal);
        const isAddress = isOverlayOpen(addressModal);

        const shouldHide = isCart || isOrders || isCheckout || isLogin || isSuccess || isAddress;
        isBottomNavHidden = shouldHide;

        if (shouldHide) {
          document.body.classList.add('bnav-hidden');
          document.body.classList.add('overlay-open');
        } else {
          document.body.classList.remove('bnav-hidden');
          document.body.classList.remove('overlay-open');
          document.body.classList.remove('signin-open');
          document.body.classList.remove('checkout-open');
          syncUnderlyingTab();
        }

        if (isLogin) {
          document.body.classList.add('signin-open');
        } else {
          document.body.classList.remove('signin-open');
        }
      });
    }`;

replaceNorm(oldSyncBottomBarFn, newSyncBottomBarFn, 'syncBottomBar Single State Driver');

// 15. WhatsApp prefilled messages
replaceNorm(
  `const msg = encodeURIComponent(\`Hello RA Store! I placed order #\${orderId} for ₹\${total}.\${slotNote}\\nName: \${customer.name}\\nAddress: \${customer.address}\`);`,
  `const msg = encodeURIComponent(\`Hello Sri Sai! I placed order #\${orderId} for ₹\${total}.\${slotNote}\\nName: \${customer.name}\\nAddress: \${customer.address}\`);`,
  'WhatsApp Link Text'
);

// 16. Telugu & English translations in I18N
replaceNorm(
  `        accountWelcomeTitle: "Welcome to RA Store",
        accountWelcomeSub: "Sign in with your mobile number or Google account to view your saved addresses, track deliveries, and manage your profile.",`,
  `        accountWelcomeTitle: "Welcome to Sri Sai",
        accountWelcomeSub: "Sign in with your email or Google account to view your saved addresses, track deliveries, and manage your profile.",`,
  'I18N en account welcome'
);

replaceNorm(
  `        shareStoreBtn: "Share RA Store with Friends & Family",
        logoutBtnText: "🚪 Log Out",
        logoutConfirm: "Log out of RA Store?",`,
  `        shareStoreBtn: "Share Sri Sai with Friends & Family",
        logoutBtnText: "🚪 Log Out",
        logoutConfirm: "Log out of Sri Sai?",`,
  'I18N en share & logout'
);

replaceNorm(
  `        phoneLoginTitle: "RA స్టోర్‌కు లాగిన్ అవ్వండి",
        phoneLoginSub: "కిరాణా డెలివరీ మరియు ఆర్డర్ ట్రాకింగ్ కోసం మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.",
        sendOtpBtn: "SMS ద్వారా OTP పంపండి",
        sendingOtp: "OTP పంపుతున్నాం...",
        otpSentTo: "OTP పంపబడిన నంబర్: ",
        changeNumber: "మార్చండి",
        enterOtpLabel: "6 అంకెల ధృవీకరణ కోడ్ నమోదు చేయండి",
        verifyOtpBtn: "ధృవీకరించి లాగిన్ అవ్వండి",
        verifyingOtp: "ధృవీకరిస్తున్నాం...",
        resendOtp: "మళ్ళీ OTP పంపండి",
        orDivider: "లేదా",
        signInWithGoogle: "Google తో లాగిన్ అవ్వండి",`,
  `        phoneLoginTitle: "శ్రీ సాయి కి లాగిన్ అవ్వండి",
        phoneLoginSub: "కిరాణా డెలివరీ మరియు ఆర్డర్ ట్రాకింగ్ కోసం మీ ఈమెయిల్ నమోదు చేయండి.",
        sendOtpBtn: "కోడ్ పంపండి",
        sendingOtp: "కోడ్ పంపుతున్నాం...",
        otpSentTo: "కోడ్ పంపబడిన ఈమెయిల్: ",
        changeNumber: "మార్చండి",
        enterOtpLabel: "6 అంకెల ధృవీకరణ కోడ్ నమోదు చేయండి",
        verifyOtpBtn: "ధృవీకరించి లాగిన్ అవ్వండి",
        verifyingOtp: "ధృవీకరిస్తున్నాం...",
        resendOtp: "మళ్ళీ కోడ్ పంపండి",
        orDivider: "లేదా",
        signInWithGoogle: "Google తో కొనసాగండి",`,
  'I18N te phone auth strings'
);

replaceNorm(
  `        accountWelcomeTitle: "RA స్టోర్‌కు స్వాగతం",
        accountWelcomeSub: "మీ భద్రపరిచిన చిరునామాలు, డెలివరీలు మరియు ప్రొఫైల్ కోసం మీ మొబైల్ నంబర్ లేదా Google తో లాగిన్ అవ్వండి.",`,
  `        accountWelcomeTitle: "శ్రీ సాయి స్టోర్‌కు స్వాగతం",
        accountWelcomeSub: "మీ భద్రపరిచిన చిరునామాలు, డెలివరీలు మరియు ప్రొఫైల్ కోసం మీ ఈమెయిల్ లేదా Google తో లాగిన్ అవ్వండి.",`,
  'I18N te account welcome'
);

replaceNorm(
  `        logoutConfirm: "RA స్టోర్ నుండి లాగ్ అవుట్ అవ్వాలా?",`,
  `        logoutConfirm: "శ్రీ సాయి నుండి లాగ్ అవుట్ అవ్వాలా?",`,
  'I18N te logout confirm'
);

// 17. Brand Text occurrences in index.html (preserving database and localStorage keys)
// Note: keep ra_store_lang, ra_cart, ra_last_order, ra_user_address, ra-store-api etc.
html = html.replace(/RA Store/g, 'Sri Sai');
html = html.replace(/RA Stores/g, 'Sri Sai');
html = html.replace(/RA_Store/g, 'Sri_Sai');

fs.writeFileSync('index.html', html, 'utf8');
console.log('🎉 index.html successfully updated and verified!');

