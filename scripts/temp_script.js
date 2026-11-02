
    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    const APP_VERSION = "v2.1.1";
    const SVG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='110' viewBox='0 0 140 110'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='12' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ERA Store%3C/text%3E%3C/svg%3E";

    function handleProductImgError(el) {
      if (el) {
        el.onerror = null;
        el.src = SVG_PLACEHOLDER;
      }
    }

    function safeImage(url) {
      if (!url || typeof url !== 'string') return SVG_PLACEHOLDER;
      if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('data:image/')) {
        return escapeHtml(url);
      }
      return SVG_PLACEHOLDER;
    }

    function getCachedProductImage(id, version) {
      try {
        const item = localStorage.getItem('ra_img_' + id);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed && parsed.v === version && parsed.data) {
            return parsed.data;
          }
        }
      } catch (e) {}
      return null;
    }

    function setCachedProductImage(id, version, data) {
      try {
        localStorage.setItem('ra_img_' + id, JSON.stringify({ v: version, data: data }));
      } catch (e) {
        try {
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('ra_img_')) keys.push(k);
          }
          for (let i = 0; i < Math.min(keys.length, 10); i++) {
            localStorage.removeItem(keys[i]);
          }
          localStorage.setItem('ra_img_' + id, JSON.stringify({ v: version, data: data }));
        } catch (e2) {}
      }
    }

    const pendingImageFetches = new Set();
    function loadProductImageLazily(id, version) {
      if (pendingImageFetches.has(id)) return;
      pendingImageFetches.add(id);

      db.ref('productImages/' + id).once('value').then(snap => {
        pendingImageFetches.delete(id);
        const dataUrl = snap.val();
        if (dataUrl && typeof dataUrl === 'string') {
          setCachedProductImage(id, version, dataUrl);
          document.querySelectorAll('.product-img-' + id).forEach(img => {
            img.src = dataUrl;
          });
        }
      }).catch(() => {
        pendingImageFetches.delete(id);
      });
    }

    // Lazy load Razorpay Checkout only on-demand
    function loadRazorpaySdk() {
      return new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Razorpay payment gateway'));
        document.body.appendChild(script);
      });
    }

    const isInApp = /FBAN|FBAV|Instagram|WhatsApp|Line|Twitter|Snapchat/i.test(navigator.userAgent);
    if (isInApp) {
      document.getElementById('inAppBrowserBanner').style.display = 'block';
    }

    const firebaseConfig = {
      apiKey: "AIzaSyD94vWB3NBEjSGmbO6JQ5F1t6L9Js7er8Y",
      authDomain: "k-store-ae9dd.firebaseapp.com",
      databaseURL: "https://k-store-ae9dd-default-rtdb.firebaseio.com",
      projectId: "k-store-ae9dd",
      storageBucket: "k-store-ae9dd.firebasestorage.app",
      messagingSenderId: "836118831556",
      appId: "1:836118831556:web:252f2b36309ef7ed220491",
      measurementId: "G-XER98BP06Y"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    if (auth.setPersistence && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => console.warn('[Auth] Persistence setup:', e));
    }

    const WORKER_API = "https://ra-store-api.chowdarynikhil095.workers.dev";

    // ========================================================
    // STEP 2: HIDDEN DEBUG PANEL (Active only with ?debug=1 in URL)
    // ========================================================
    const isDebugMode = (new URLSearchParams(window.location.search)).get('debug') === '1';
    let debugHudEl = null;
    const debugState = {
      appVersion: APP_VERSION,
      backendConnected: 'Checking...',
      authState: 'Initializing...',
      productCount: 0,
      categoryCount: 0,
      swState: ('serviceWorker' in navigator) ? 'Supported' : 'Unsupported',
      notifPerm: ('Notification' in window) ? Notification.permission : 'Unsupported',
      lastError: 'None'
    };

    function updateDebugHud() {
      if (!isDebugMode) return;
      if (!debugHudEl) {
        debugHudEl = document.createElement('div');
        debugHudEl.id = 'debugHud';
        debugHudEl.style.cssText = 'position:fixed;top:64px;right:8px;z-index:99999;background:rgba(17,24,39,0.96);color:#E5E7EB;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;line-height:1.45;padding:12px 14px;border-radius:10px;border:1px solid #374151;box-shadow:0 12px 28px rgba(0,0,0,0.5);max-width:320px;max-height:60vh;overflow-y:auto;pointer-events:auto;';
        document.body.appendChild(debugHudEl);
      }
      const isOnline = navigator.onLine ? 'Online' : 'Offline';
      debugHudEl.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #374151;padding-bottom:6px;margin-bottom:8px;">
          <strong style="color:#10B981;font-size:12px;">🛠️ RA STORE DIAGNOSTICS</strong>
          <button onclick="document.getElementById('debugHud').remove()" style="background:none;border:none;color:#9CA3AF;cursor:pointer;font-size:14px;line-height:1;">✕</button>
        </div>
        <div><strong>App Version:</strong> <span style="color:#60A5FA;">${escapeHtml(debugState.appVersion)}</span></div>
        <div><strong>Backend:</strong> <span style="color:${debugState.backendConnected.includes('Connected') ? '#34D399' : '#EF4444'};">${escapeHtml(debugState.backendConnected)}</span> (${isOnline})</div>
        <div><strong>Auth State:</strong> <span style="color:#FBBF24;">${escapeHtml(debugState.authState)}</span></div>
        <div><strong>Catalog Counts:</strong> <span style="color:#A78BFA;">${debugState.productCount} products • ${debugState.categoryCount} categories</span></div>
        <div><strong>Service Worker:</strong> <span style="color:#38BDF8;">${escapeHtml(debugState.swState)}</span></div>
        <div><strong>Notifications:</strong> <span style="color:#F472B6;">${escapeHtml(debugState.notifPerm)}</span></div>
        <div style="margin-top:6px;padding-top:6px;border-top:1px solid #374151;">
          ${debugState.lastError !== 'None' ? `
            <div style="padding:4px 6px;background:rgba(220,38,38,0.25);border-left:3px solid #EF4444;color:#FCA5A5;word-break:break-word;">
              <strong>Last Error:</strong> ${escapeHtml(debugState.lastError)}
            </div>
          ` : '<div style="color:#9CA3AF;"><strong>Last Error:</strong> None</div>'}
        </div>
      `;
    }

    function debugLog(key, value, isError = false) {
      if (key in debugState) {
        debugState[key] = value;
      }
      if (isError) {
        console.error('[RA Store Debug - ' + key + ']', value);
      } else {
        console.log('[RA Store Debug - ' + key + ']', value);
      }
      updateDebugHud();
    }
    if (isDebugMode) updateDebugHud();

    let cart = JSON.parse(localStorage.getItem('ra_store_cart') || '{}');
    let productsCatalog = {};
    let categoriesCatalog = {};
    let currentUser = null;
    let currentCategory = 'all';
    let searchQuery = '';
    let searchTimeout = null;
    let loggedMisses = new Set();
    let ordersRef = null;

    let storeSettings = {
      deliveryFee: 25,
      freeDeliveryThreshold: 299,
      whatsappNumber: '916281730144',
      storeHours: { open: "07:00", close: "21:00", mode: "auto" }
    };
    let isStoreCurrentlyOpen = true;

    let currentLang = localStorage.getItem('ra_store_lang') || 'en';

    const I18N = {
      en: {
        toggleText: "తెలుగు",
        searchPlaceholder: "Search fresh groceries (e.g. Milk, Tomato, పాలు)...",
        allCategory: "All Items",
        categoryFallbackMsg: "Category not found or empty. Showing all items.",
        catalogHeading: "Fresh Groceries & daily staples",
        refundTitle: "100% Refund if you cancel before order is out for delivery",
        refundDesc: "Automated full refund to your original payment method (UPI / Card / Bank) in 5-7 working days.",
        addBtn: "+ Add",
        outOfStock: "Out of Stock",
        checkout: "Proceed to Checkout",
        myOrders: "My Orders",
        bnavCategories: "Categories",
        liveOrdersTitle: "Live Orders & Live Tracking",
        pastOrdersTitle: "Past Orders",
        notifCardTitle: "Notifications",
        notifOrderUpdatesTitle: "Order updates",
        notifOrderUpdatesSub: "Live alerts for order placed, accepted, packed, and out for delivery",
        notifOffersTitle: "Offers & reminders",
        notifOffersSub: "Reorder reminders and occasional deals (max 3 a week)",
        successNotifPromptTitle: "Get live updates for this order?",
        successNotifPromptSub: "We'll also send occasional offers (max 3 a week). You can turn these off anytime in Account.",
        notifAllowedToast: "Notifications enabled! You'll receive live order tracking updates.",
        notifBlockedToast: "Notifications are blocked in your browser settings.",
        cartNav: "Cart",
        yourCart: "Your Cart",
        itemsCount: "{n} items",
        emptyCartMsg: "Your cart is empty",
        emptyCartSub: "Add fresh items to your cart to order Anantapur delivery.",
        startShopping: "Start Shopping",
        drawerSubtotal: "Item Subtotal",
        drawerDeliveryFee: "Delivery Fee",
        free: "FREE",
        drawerTotal: "Total Amount",
        clearCart: "Clear",
        clearConfirm: "Are you sure you want to clear all items in your cart?",
        cartCleared: "Cart has been cleared.",
        signIn: "Sign In",
        authReq: "Sign in required to order",
        freeDelNotice: "🎉 Free Delivery applied!",
        moreForFree: "Add ₹{val} more for Free Delivery",
        reorder: "🔁 Reorder Last",
        viewCartText: "View Cart ⌃",
        phoneLoginTitle: "Sign In to RA Store",
        phoneLoginSub: "Enter your 10-digit mobile number for instant Anantapur grocery delivery and tracking.",
        sendOtpBtn: "Send OTP via SMS",
        sendingOtp: "Sending OTP...",
        otpSentTo: "OTP sent to: ",
        changeNumber: "Change",
        enterOtpLabel: "Enter 6-Digit Verification Code",
        verifyOtpBtn: "Verify & Sign In",
        verifyingOtp: "Verifying...",
        resendOtp: "Resend OTP",
        orDivider: "OR",
        signInWithGoogle: "Sign in with Google",
        deliveryAreaTitle: "Anantapur Delivery Zone",
        deliveryAreaDesc: "Delivering across Anantapur (515001 - 515005)",
        quickLandmarks: "Quick Landmarks:",
        orderSummaryHeading: "Order Summary",
        payOnlineTitle: "Online Payment (UPI / Card)",
        payOnlineSub: "PhonePe, GPay, Paytm, Cards • 100% Refundable",
        payCodTitle: "Cash on Delivery (COD)",
        payCodSub: "Pay cash when groceries reach your doorstep",
        confirmOrderBtn: "Confirm & Place Order",
        scheduleForMorning: "📅 Schedule for 7:00 AM Delivery",
        storeClosedScheduleBanner: "🌙 Store is closed for the night. You can order now for scheduled delivery at 7:00 AM IST!",
        scheduledSlotHeading: "Scheduled Morning Delivery",
        scheduledSlotSub: "Store is currently closed. Your groceries will be packed fresh first thing in the morning!",
        stepPlaced: "Placed",
        stepPacked: "Packed",
        stepOut: "Out for Delivery",
        stepDelivered: "Delivered",
        stepCancelled: "Cancelled",
        reorderOrderBtn: "🔁 Reorder Items",
        cancelOrderBtn: "Cancel Order",
        itemsAddedToast: "Items added to cart!",
        validNameErr: "Please enter your full name (at least 2 characters).",
        validPhoneErr: "Please enter a valid 10-digit mobile number starting with 6-9.",
        validAddressErr: "Please enter your detailed delivery address in Anantapur (at least 10 characters).",
        invalidPinErr: "Delivery is currently available only in Anantapur city (PIN codes 515001 - 515005). The entered PIN code is outside our service area.",
        priceUpdatedMsg: "Prices were updated. Server total is ₹{serverTotal} (was ₹{clientTotal}). Please review and tap Confirm again.",
        orderHeldNotice: "Payment not completed — your order is held for 15 minutes.",
        payNowBtn: "Pay Now ⚡",
        confirmingPayment: "Confirming your payment with bank… please wait…",
        paymentFailedContact: "Payment verification pending. If amount was debited, it will be automatically confirmed or contact store at {phone}.",
        cancelCodConfirm: "Cancel this Cash on Delivery order?",
        cancelPaidConfirm: "Cancel this order? ₹{amount} will be refunded to your original payment method in 5-7 working days.",
        cancelUnpaidConfirm: "Cancel this unpaid order?",
        badgePaid: "PAID ✅",
        badgeCod: "Pay on delivery 💵",
        badgeAwaiting: "⏳ Awaiting payment",
        badgeRefundInitiated: "Refund initiated",
        badgeRefunded: "Refunded ✅",
        expired: "Expired",
        outOfStockCartBanner: "⚠️ Some items in your cart are out of stock. Please remove them to proceed.",
        removeOutOfStockBtn: "Remove Out-of-Stock Items",
        offlineNotice: "⚡ You are currently offline. Check your internet connection.",
        bnavHome: "Home",
        bnavCart: "Cart",
        bnavOrders: "Orders",
        bnavAccount: "Account",
        accountWelcomeTitle: "Welcome to RA Store",
        accountWelcomeSub: "Sign in with your mobile number or Google account to view your saved addresses, track deliveries, and manage your profile.",
        statOrdersPlaced: "Orders Placed",
        statLastOrder: "Last Order",
        noneYet: "None yet",
        savedAddresses: "Saved Addresses",
        noSavedAddresses: "No saved addresses yet. Add Home or Shop address for 1-tap checkout.",
        addNewAddressBtn: "+ Add New",
        storeInfoTitle: "Store & Delivery Timings",
        deliverySlotLabel: "Morning Delivery Slot:",
        storeHoursLabel: "Store Operating Hours:",
        helpSupportTitle: "Help & Support",
        callStoreText: "📞 Call Store (+91 62817 30144)",
        whatsappStoreText: "💬 WhatsApp Chat (+91 62817 30144)",
        aboutPoliciesTitle: "About & Policies",
        aboutUsLink: "About Us",
        contactUsLink: "Contact Us",
        termsLink: "Terms of Service",
        privacyLink: "Privacy Policy",
        refundPolicyLink: "Cancellation & Refund Policy",
        shippingPolicyLink: "Shipping & Delivery Policy",
        shareStoreBtn: "Share RA Store with Friends & Family",
        logoutBtnText: "🚪 Log Out",
        logoutConfirm: "Log out of RA Store?",
        loggedOutToast: "Logged out successfully",
        deleteAccountLink: "Delete my account",
        deleteAccountConfirm: "Are you sure you want to delete your profile and saved addresses? Your past orders will remain in the store records.",
        accountDeletedToast: "Account data deleted",
        gettingLocation: "Getting location…",
        shareLocationBtn: "Share my location",
        updateLocationBtn: "Update location",
        locationSaved: "Location saved (~{acc}m accuracy)",
        locationApprox: "Location saved (approximate: ~{acc}m)",
        tryAgain: "Try again",
        checkMap: "🗺️ Check Map",
        removeLocation: "✕ Remove",
        locErrDenied: "Location permission denied. Tap the lock icon (🔒) in your address bar → Permissions → Location → Allow, then retry.",
        locErrUnavailable: "Position unavailable. Please ensure your device GPS/Location is turned ON and try again.",
        locErrTimeout: "Location request timed out. Please move near a window or outdoors and retry.",
        locErrUnsupported: "Geolocation is not supported by your browser.",
        locErrInApp: "In-app browser may block GPS. Tap top-right menu ⋮ → Open in Chrome.",
        defaultBadge: "Default",
        setDefaultBtn: "Set Default",
        deleteAddrConfirm: "Delete this address?",
        couldNotLoadItems: "Couldn't load items",
        retryBtn: "Retry",
        noItemsAvailable: "No items available right now",
      },
      te: {
        toggleText: "English",
        searchPlaceholder: "తాజా సరుకులు వెతకండి (ఉదా: పాలు, టమోటా, నూనె)...",
        allCategory: "అన్ని వస్తువులు",
        categoryFallbackMsg: "వర్గం కనుగొనబడలేదు లేదా ఖాళీగా ఉంది. అన్ని వస్తువులను చూపుతున్నాము.",
        catalogHeading: "తాజా కూరగాయలు & కిరాణా సరుకులు",
        refundTitle: "డెలివరీ బయలుదేరే ముందు రద్దు చేస్తే 100% వాపసు",
        refundDesc: "మీ అసలు చెల్లింపు విధానానికే (UPI/బ్యాంక్) 5-7 రోజుల్లో పూర్తి రీఫండ్ అందుతుంది.",
        addBtn: "+ చేర్చండి",
        outOfStock: "స్టాక్ లేదు",
        checkout: "ఆర్డర్ చేయండి",
        myOrders: "నా ఆర్డర్లు",
        bnavCategories: "కేటగిరీలు",
        liveOrdersTitle: "లైవ్ ఆర్డర్లు & ట్రాకింగ్",
        pastOrdersTitle: "గత ఆర్డర్లు",
        notifCardTitle: "నోటిఫికేషన్లు",
        notifOrderUpdatesTitle: "ఆర్డర్ అప్‌డేట్లు",
        notifOrderUpdatesSub: "ఆర్డర్ స్వీకరణ, ప్యాకింగ్, మరియు డెలివరీ బయలుదేరిన లైవ్ అలర్ట్‌లు",
        notifOffersTitle: "ఆఫర్లు & రిమైండర్లు",
        notifOffersSub: "సరుకుల రీ-ఆర్డర్ రిమైండర్లు మరియు ప్రత్యేక ఆఫర్లు (వారానికి గరిష్టంగా 3)",
        successNotifPromptTitle: "ఈ ఆర్డర్ కోసం లైవ్ అప్‌డేట్లు పొందాలా?",
        successNotifPromptSub: "మేము అప్పుడప్పుడు ఆఫర్లను కూడా పంపుతాము (వారానికి గరిష్టంగా 3). వీటిని ఖాతాలో ఎప్పుడైనా ఆపివేయవచ్చు.",
        notifAllowedToast: "నోటిఫికేషన్లు ప్రారంభించబడ్డాయి! మీరు లైవ్ ఆర్డర్ ట్రాకింగ్ పొందుతారు.",
        notifBlockedToast: "మీ బ్రౌజర్ సెట్టింగ్‌లలో నోటిఫికేషన్లు నిరోధించబడ్డాయి.",
        cartNav: "కార్ట్",
        yourCart: "మీ కార్ట్",
        itemsCount: "{n} వస్తువులు",
        emptyCartMsg: "మీ కార్ట్ ఖాళీగా ఉంది",
        emptyCartSub: "డెలివరీ కోసం తాజా సరుకులను కార్ట్‌కు జోడించండి.",
        startShopping: "షాపింగ్ ప్రారంభించండి",
        drawerSubtotal: "సరుకుల మొత్తం",
        drawerDeliveryFee: "డెలివరీ ఛార్జ్",
        free: "ఉచితం",
        drawerTotal: "మొత్తం చెల్లించాల్సింది",
        clearCart: "ఖాళీ చేయి",
        clearConfirm: "మీ కార్ట్‌లోని అన్ని వస్తువులను తొలగించాలనుకుంటున్నారా?",
        cartCleared: "కార్ట్ ఖాళీ చేయబడింది.",
        signIn: "లాగిన్",
        authReq: "ఆర్డర్ చేయడానికి లాగిన్ అవ్వండి",
        freeDelNotice: "🎉 ఉచిత డెలివరీ వర్తిస్తుంది!",
        moreForFree: "ఉచిత డెలివరీ కోసం ఇంకో ₹{val} జోడించండి",
        reorder: "🔁 మళ్ళీ ఆర్డర్",
        viewCartText: "కార్ట్ చూడండి ⌃",
        phoneLoginTitle: "RA స్టోర్‌కు లాగిన్ అవ్వండి",
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
        signInWithGoogle: "Google తో లాగిన్ అవ్వండి",
        deliveryAreaTitle: "అనంతపురం డెలివరీ జోన్",
        deliveryAreaDesc: "అనంతపురం నగర పరిధిలోని అన్ని ప్రాంతాలకు డెలివరీ (515001 - 515005)",
        quickLandmarks: "ముఖ్యమైన గుర్తులు:",
        orderSummaryHeading: "ఆర్డర్ వివరాలు",
        payOnlineTitle: "ఆన్‌లైన్ చెల్లింపు (UPI / కార్డ్)",
        payOnlineSub: "PhonePe, GPay, Paytm, కార్డ్స్ • 100% రీఫండ్ హామీ",
        payCodTitle: "క్యాష్ ఆన్ డెలివరీ (సరుకులు వచ్చాక నగదు)",
        payCodSub: "సరుకులు ఇంటికి చేరిన తర్వాత నగదు చెల్లించండి",
        confirmOrderBtn: "ఆర్డర్ ధృవీకరించండి",
        scheduleForMorning: "📅 ఉదయం 7:00 AM కి డెలివరీ షెడ్యూల్",
        storeClosedScheduleBanner: "🌙 స్టోర్ ఇప్పుడు మూసివేయబడింది. మీరు ఉదయం 7:00 AM డెలివరీ కోసం ఇప్పుడే ఆర్డర్ బుక్ చేసుకోవచ్చు!",
        scheduledSlotHeading: "షెడ్యూల్డ్ ఉదయపు డెలివరీ",
        scheduledSlotSub: "స్టోర్ ఇప్పుడు మూసివేయబడింది. ఉదయం మొదటి డెలివరీలో మీ సరుకులు ప్యాక్ చేయబడతాయి!",
        stepPlaced: "ఆర్డర్ అందింది",
        stepPacked: "ప్యాకింగ్",
        stepOut: "బయలుదేరింది 🛵",
        stepDelivered: "చేరింది ✅",
        stepCancelled: "రద్దయింది ❌",
        reorderOrderBtn: "🔁 మళ్ళీ ఆర్డర్",
        cancelOrderBtn: "రద్దు చేయండి",
        itemsAddedToast: "వస్తువులు కార్ట్‌కు జోడించబడ్డాయి!",
        validNameErr: "దయచేసి మీ పూర్తి పేరు నమోదు చేయండి (కనీసం 2 అక్షరాలు).",
        validPhoneErr: "దయచేసి 6, 7, 8 లేదా 9 తో మొదలయ్యే 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.",
        validAddressErr: "దయచేసి అనంతపురంలోని మీ ఇంటి చిరునామా నమోదు చేయండి (కనీసం 10 అక్షరాలు).",
        invalidPinErr: "ప్రస్తుతం అనంతపురం నగర పరిధిలోనే (పిన్‌కోడ్‌లు 515001 నుండి 515005) డెలివరీ అందుబాటులో ఉంది. నమోదు చేసిన పిన్‌కోడ్ సర్వీస్ పరిధిలో లేదు.",
        priceUpdatedMsg: "ధరలు మారాయి. మొత్తం బిల్లు ₹{serverTotal} (గతంలో ₹{clientTotal}). దయచేసి మళ్ళీ ధృవీకరించండి.",
        orderHeldNotice: "చెల్లింపు పూర్తి కాలేదు — మీ ఆర్డర్ 15 నిమిషాల పాటు భద్రపరచబడింది.",
        payNowBtn: "ఇప్పుడే చెల్లించండి ⚡",
        confirmingPayment: "మీ చెల్లింపును ధృవీకరిస్తున్నాం… దయచేసి వేచి ఉండండి…",
        paymentFailedContact: "చెల్లింపు ధృవీకరణ వేచి ఉంది. ఖాతాలో డబ్బులు కట్ అయితే, కొద్దిసేపట్లో ఆర్డర్ అప్‌డేట్ అవుతుంది లేదా స్టోర్ నంబర్ {phone} కి సంప్రదించండి.",
        cancelCodConfirm: "ఈ క్యాష్ ఆన్ డెలివరీ ఆర్డర్‌ను రద్దు చేయాలనుకుంటున్నారా?",
        cancelPaidConfirm: "ఈ ఆర్డర్ రద్దు చేయాలనుకుంటున్నారా? ₹{amount} మొత్తం మీ అసలు బ్యాంక్ ఖాతాకు 5-7 రోజుల్లో రీఫండ్ అవుతుంది.",
        cancelUnpaidConfirm: "ఈ ఆర్డర్‌ను రద్దు చేయాలనుకుంటున్నారా?",
        badgePaid: "చెల్లించారు ✅",
        badgeCod: "డెలివరీ వద్ద నగదు 💵",
        badgeAwaiting: "⏳ చెల్లింపు కోసం వేచి ఉంది",
        badgeRefundInitiated: "రీఫండ్ ప్రారంభమైంది",
        badgeRefunded: "రీఫండ్ చేయబడింది ✅",
        expired: "గడువు ముగిసింది",
        outOfStockCartBanner: "⚠️ మీ కార్ట్‌లోని కొన్ని వస్తువులు స్టాక్‌లో లేవు. కొనసాగడానికి దయచేసి వాటిని తొలగించండి.",
        removeOutOfStockBtn: "స్టాక్ లేని వస్తువులను తొలగించండి",
        offlineNotice: "⚡ మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేయండి.",
        bnavHome: "హోమ్",
        bnavCart: "కార్ట్",
        bnavOrders: "ఆర్డర్లు",
        bnavAccount: "ఖాతా",
        accountWelcomeTitle: "RA స్టోర్‌కు స్వాగతం",
        accountWelcomeSub: "మీ భద్రపరిచిన చిరునామాలు, డెలివరీలు మరియు ప్రొఫైల్ కోసం మీ మొబైల్ నంబర్ లేదా Google తో లాగిన్ అవ్వండి.",
        statOrdersPlaced: "చేసిన ఆర్డర్లు",
        statLastOrder: "చివరి ఆర్డర్",
        noneYet: "ఇంకా లేవు",
        savedAddresses: "భద్రపరిచిన చిరునామాలు",
        noSavedAddresses: "ఇంకా చిరునామాలు లేవు. సులభంగా ఆర్డర్ చేయడానికి హోమ్ లేదా షాప్ అడ్రస్ జోడించండి.",
        addNewAddressBtn: "+ కొత్తది జోడించండి",
        storeInfoTitle: "స్టోర్ & డెలివరీ సమాచారం",
        deliverySlotLabel: "ఉదయం డెలివరీ సమయం:",
        storeHoursLabel: "స్టోర్ తెరిచే వేళలు:",
        helpSupportTitle: "సహాయం & మద్దతు",
        callStoreText: "📞 కాల్ చేయండి (+91 62817 30144)",
        whatsappStoreText: "💬 వాట్సాప్ చాట్ (+91 62817 30144)",
        aboutPoliciesTitle: "మా గురించి & నిబంధనలు",
        aboutUsLink: "మా గురించి",
        contactUsLink: "మమ్మల్ని సంప్రదించండి",
        termsLink: "నిబంధనలు & షరతులు",
        privacyLink: "గోప్యతా విధానం",
        refundPolicyLink: "రద్దు & రీఫండ్ విధానం",
        shippingPolicyLink: "షిప్పింగ్ & డెలివరీ విధానం",
        shareStoreBtn: "స్నేహితులు & కుటుంబ సభ్యులతో షేర్ చేయండి",
        logoutBtnText: "🚪 లాగ్ అవుట్",
        logoutConfirm: "RA స్టోర్ నుండి లాగ్ అవుట్ అవ్వాలా?",
        loggedOutToast: "లాగ్ అవుట్ అయ్యారు",
        deleteAccountLink: "నా ఖాతాను తొలగించండి",
        deleteAccountConfirm: "మీ ప్రొఫైల్ మరియు భద్రపరిచిన చిరునామాలను తొలగించాలనుకుంటున్నారా? మీ గత ఆర్డర్ల రికార్డులు స్టోర్ వద్ద ఉంటాయి.",
        accountDeletedToast: "ఖాతా వివరాలు తొలగించబడ్డాయి",
        gettingLocation: "లొకేషన్ తీసుకుంటోంది…",
        shareLocationBtn: "లొకేషన్ షేర్ చేయండి",
        updateLocationBtn: "లొకేషన్ మార్చండి",
        locationSaved: "లొకేషన్ సేవ్ చేయబడింది (~{acc}మీ ఖచ్చితత్వం)",
        locationApprox: "లొకేషన్ సేవ్ చేయబడింది (సుమారు: ~{acc}మీ)",
        tryAgain: "మళ్లీ ప్రయత్నించండి",
        checkMap: "🗺️ మ్యాప్ చూడండి",
        removeLocation: "✕ తొలగించు",
        locErrDenied: "లొకేషన్ అనుమతి నిరాకరించబడింది. అడ్రస్ బార్‌లోని లాక్ చిహ్నాన్ని (🔒) నొక్కి → Permissions → Location → Allow చేసి, మళ్లీ ప్రయత్నించండి.",
        locErrUnavailable: "లొకేషన్ అందుబాటులో లేదు. దయచేసి ఫోన్‌లో GPS/లొకేషన్ ఆన్ చేసి మళ్లీ ప్రయత్నించండి.",
        locErrTimeout: "లొకేషన్ సమయం ముగిసింది. దయచేసి కిటికీ లేదా బయటకు వచ్చి మళ్లీ ప్రయత్నించండి.",
        locErrUnsupported: "మీ బ్రౌజర్ లొకేషన్‌కు మద్దతు ఇవ్వదు.",
        locErrInApp: "ఇన్-యాప్ బ్రౌజర్‌లో జీపీఎస్ బ్లాక్ కావచ్చు. పైన ⋮ మెనూ నొక్కి 'Open in Chrome' ఎంచుకోండి.",
        defaultBadge: "డిఫాల్ట్",
        setDefaultBtn: "డిఫాల్ట్‌గా ఉంచు",
        deleteAddrConfirm: "ఈ చిరునామాను తొలగించాలనుకుంటున్నారా?",
        couldNotLoadItems: "వస్తువులను లోడ్ చేయడం సాధ్యపడలేదు",
        retryBtn: "మళ్ళీ ప్రయత్నించండి",
        noItemsAvailable: "ప్రస్తుతం ఏ వస్తువులు అందుబాటులో లేవు"
      }
    };

    function applyLanguage(lang) {
      currentLang = lang;
      localStorage.setItem('ra_store_lang', lang);
      const t = I18N[lang];
      document.getElementById('langToggleBtn').innerText = t.toggleText;
      document.getElementById('searchInput').placeholder = t.searchPlaceholder;
      document.getElementById('tRefundTitle').innerText = t.refundTitle;
      document.getElementById('tRefundDesc').innerText = t.refundDesc;
      document.getElementById('tCatalogHeading').innerText = t.catalogHeading;
      
      const brandTitleEl = document.getElementById('navbarBrandTitle');
      if (brandTitleEl) brandTitleEl.innerText = (lang === 'te' ? 'RA స్టోర్' : 'RA Store');
      
      const ordersFull = document.querySelector('.nav-orders-text-full');
      const ordersShort = document.querySelector('.nav-orders-text-short');
      if (ordersFull) ordersFull.innerText = t.myOrders;
      if (ordersShort) ordersShort.innerText = (lang === 'te' ? 'ఆర్డర్లు' : 'Orders');

      const cartNavText = document.querySelector('.nav-cart-text');
      if (cartNavText) cartNavText.innerText = t.cartNav;

      document.getElementById('cartDrawerTitle').innerText = t.yourCart;
      document.getElementById('tDrawerSubtotal').innerText = t.drawerSubtotal;
      document.getElementById('tDrawerDeliveryFee').innerText = t.drawerDeliveryFee;
      document.getElementById('tDrawerTotal').innerText = t.drawerTotal;
      
      const clearBtnText = document.querySelector('.clear-cart-text');
      if (clearBtnText) clearBtnText.innerText = t.clearCart;

      if (!currentUser) document.getElementById('loginBtn').innerText = t.signIn;
      document.getElementById('reorderLastBtn').innerText = t.reorder;

      // Translations for Phone Login & Checkout
      document.getElementById('loginModalTitle').innerText = t.phoneLoginTitle;
      document.getElementById('tPhoneLoginSub').innerText = t.phoneLoginSub;
      document.getElementById('sendOtpBtn').innerText = t.sendOtpBtn;
      document.getElementById('tOtpSentTo').innerText = t.otpSentTo;
      document.getElementById('changePhoneBtn').innerText = t.changeNumber;
      document.getElementById('tEnterOtpLabel').innerText = t.enterOtpLabel;
      document.getElementById('verifyOtpBtn').innerText = t.verifyOtpBtn;
      document.getElementById('tOrDivider').innerText = t.orDivider;
      document.getElementById('tSignInWithGoogle').innerText = t.signInWithGoogle;
      document.getElementById('tDeliveryAreaTitle').innerText = t.deliveryAreaTitle;
      document.getElementById('tDeliveryAreaDesc').innerText = t.deliveryAreaDesc;
      document.getElementById('tQuickLandmarks').innerText = t.quickLandmarks;
      document.getElementById('tOrderSummaryHeading').innerText = t.orderSummaryHeading;
      document.getElementById('tPayOnlineTitle').innerText = t.payOnlineTitle;
      document.getElementById('tPayOnlineSub').innerText = t.payOnlineSub;
      document.getElementById('tPayCodTitle').innerText = t.payCodTitle;
      document.getElementById('tPayCodSub').innerText = t.payCodSub;

      // Phase 3 Scheduled delivery translations
      document.getElementById('storeClosedBanner').innerText = t.storeClosedScheduleBanner;
      document.getElementById('tScheduledDeliveryTitle').innerText = t.scheduledSlotHeading;
      document.getElementById('tScheduledDeliveryDesc').innerText = t.scheduledSlotSub;
      document.getElementById('ordersModalTitle').innerText = (lang === 'te' ? 'నా ఆర్డర్లు & లైవ్ ట్రాకింగ్' : 'My Orders & Live Tracking');

      // Update Bottom Navigation labels & aria-labels
      if (document.getElementById('tBnavHome')) document.getElementById('tBnavHome').innerText = t.bnavHome || (lang === 'te' ? 'హోమ్' : 'Home');
      if (document.getElementById('tBnavCategories')) document.getElementById('tBnavCategories').innerText = t.bnavCategories || (lang === 'te' ? 'కేటగిరీలు' : 'Categories');
      if (document.getElementById('bnavCategoriesBtn')) document.getElementById('bnavCategoriesBtn').setAttribute('aria-label', t.bnavCategories || (lang === 'te' ? 'కేటగిరీలు' : 'Categories'));
      if (document.getElementById('tBnavCart')) document.getElementById('tBnavCart').innerText = t.bnavCart || (lang === 'te' ? 'కార్ట్' : 'Cart');
      if (document.getElementById('tBnavOrders')) document.getElementById('tBnavOrders').innerText = t.bnavOrders || (lang === 'te' ? 'ఆర్డర్లు' : 'Orders');
      if (document.getElementById('tBnavAccount')) document.getElementById('tBnavAccount').innerText = t.bnavAccount || (lang === 'te' ? 'ఖాతా' : 'Account');
      if (document.getElementById('bnavHomeBtn')) document.getElementById('bnavHomeBtn').setAttribute('aria-label', t.bnavHome || (lang === 'te' ? 'హోమ్' : 'Home'));
      if (document.getElementById('bnavCartBtn')) document.getElementById('bnavCartBtn').setAttribute('aria-label', t.bnavCart || (lang === 'te' ? 'కార్ట్' : 'Cart'));
      if (document.getElementById('bnavOrdersBtn')) document.getElementById('bnavOrdersBtn').setAttribute('aria-label', t.bnavOrders || (lang === 'te' ? 'ఆర్డర్లు' : 'Orders'));
      if (document.getElementById('bnavAccountBtn')) document.getElementById('bnavAccountBtn').setAttribute('aria-label', t.bnavAccount || (lang === 'te' ? 'ఖాతా' : 'Account'));

      checkStoreHours();
      renderCategoryChips();
      renderLandmarkChips();
      renderProducts();
      updateCartUI();
    }

    document.getElementById('langToggleBtn').addEventListener('click', () => {
      applyLanguage(currentLang === 'en' ? 'te' : 'en');
    });

    
    function renderLandmarkChips() {
      const container = document.getElementById('landmarkChipsContainer');
      const addrContainer = document.getElementById('addrLandmarkChips');
      const cfg = window.APP_CONFIG || {};
      const enList = cfg.landmarks || ["Tower Clock", "Subhash Road", "Saptagiri Circle", "Rudrampeta", "Kamalanagar", "Old Town"];
      const teList = cfg.landmarksTelugu || ["టవర్ క్లాక్", "సుభాష్ రోడ్డు", "సప్తగిరి సర్కిల్", "రుద్రంపేట", "కమలానగర్", "ఓల్డ్ టౌన్"];
      const isTe = currentLang === 'te';

      const generateHtml = () => enList.map((en, idx) => {
        const label = (isTe && teList[idx]) ? teList[idx] : en;
        const val = `${en}, Anantapur`;
        return `<button type="button" class="landmark-chip" data-val="${escapeHtml(val)}">${escapeHtml(label)}</button>`;
      }).join('');

      if (container) container.innerHTML = generateHtml();
      if (addrContainer) addrContainer.innerHTML = generateHtml();
    }

    function parseHourToDecimal(val, defaultVal) {
      if (!val) return defaultVal;
      const parts = String(val).split(':');
      if (parts.length === 2) return parseInt(parts[0], 10) + (parseInt(parts[1], 10) / 60);
      return parseFloat(val) || defaultVal;
    }

    function getNextDeliverySlotString() {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const ist = new Date(utc + (3600000 * 5.5));
      const hours = ist.getHours() + (ist.getMinutes() / 60);

      const dayStr = hours < 7 ? (currentLang === 'te' ? 'ఈరోజు' : 'Today') : (currentLang === 'te' ? 'రేపు' : 'Tomorrow');
      return `${dayStr}, 7:00 AM – 9:00 AM IST`;
    }

    // Phase 3: Store Closed Scheduling logic (lets users order anytime without blocking!)
    function checkStoreHours() {
      const mode = storeSettings.storeHours?.mode || 'auto';
      if (mode === 'force_open') isStoreCurrentlyOpen = true;
      else if (mode === 'force_closed') isStoreCurrentlyOpen = false;
      else {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const ist = new Date(utc + (3600000 * 5.5));
        const currentHour = ist.getHours() + (ist.getMinutes() / 60);
        const openHour = parseHourToDecimal(storeSettings.storeHours?.open, 7);
        const closeHour = parseHourToDecimal(storeSettings.storeHours?.close, 21);
        isStoreCurrentlyOpen = (currentHour >= openHour && currentHour < closeHour);
      }

      const closedBanner = document.getElementById('storeClosedBanner');
      const checkoutBtn = document.getElementById('checkoutBtn');
      const drawerCheckoutBtn = document.getElementById('cartDrawerCheckoutBtn');
      const submitBtn = document.getElementById('placeOrderSubmitBtn');
      const slotSection = document.getElementById('deliverySlotSection');
      const slotText = document.getElementById('scheduledSlotText');

      if (!isStoreCurrentlyOpen) {
        closedBanner.style.display = 'block';
        slotSection.style.display = 'block';
        slotText.innerText = getNextDeliverySlotString();

        const scheduleText = I18N[currentLang].scheduleForMorning;
        checkoutBtn.innerText = scheduleText;
        drawerCheckoutBtn.innerText = scheduleText;
        submitBtn.innerText = scheduleText;
      } else {
        closedBanner.style.display = 'none';
        slotSection.style.display = 'none';

        const normalCheckoutText = I18N[currentLang].checkout;
        checkoutBtn.innerText = normalCheckoutText;
        drawerCheckoutBtn.innerText = normalCheckoutText;
        submitBtn.innerText = I18N[currentLang].confirmOrderBtn;
      }

      checkoutBtn.disabled = false;
      drawerCheckoutBtn.disabled = false;
      checkoutBtn.style.opacity = "1";
      drawerCheckoutBtn.style.opacity = "1";
    }
    setInterval(checkStoreHours, 60000);

    db.ref('settings').on('value', snap => {
      if (snap.val()) {
        storeSettings = snap.val();
        if (storeSettings.announcement) {
          const ann = document.getElementById('announcementBanner');
          ann.innerText = storeSettings.announcement;
          ann.style.display = 'block';
        }
        checkStoreHours();
        updateCartUI();
      }
    });

    // ==========================================
    // Firebase Phone Auth & User State
    // ==========================================
    let phoneConfirmationResult = null;
    let resendTimerInterval = null;
    let pendingCheckoutAfterLogin = false;
    let pendingOrdersAfterLogin = false;

    function sanitizeIndianPhone(raw) {
      if (!raw) return null;
      let digits = String(raw).replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) {
        digits = digits.substring(2);
      } else if (digits.length === 11 && digits.startsWith('0')) {
        digits = digits.substring(1);
      }
      if (digits.length === 10 && /^[6-9]/.test(digits)) {
        return '+91' + digits;
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
      timerSpan.innerText = `(${seconds}s)`;
      
      if (resendTimerInterval) clearInterval(resendTimerInterval);
      resendTimerInterval = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
          clearInterval(resendTimerInterval);
          resendBtn.disabled = false;
          timerSpan.innerText = '';
        } else {
          timerSpan.innerText = `(${seconds}s)`;
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
    }

    document.getElementById('loginBtn').addEventListener('click', openLoginModal);

    // Header logout moved to Account tab view (#accountLogoutBtn)
    document.getElementById('logoutBtn')?.addEventListener('click', () => { auth.signOut(); });

    auth.getRedirectResult().catch(() => {});
    auth.onAuthStateChanged(user => {
      currentUser = user;
      debugLog('authState', user ? (user.isAnonymous ? 'Signed In (Guest)' : 'Signed In (Customer)') : 'Signed Out');

      // Re-trigger catalog listeners if previously blocked by unauthenticated rules
      if (!productsLoaded || Object.keys(productsCatalog).length === 0) {
        initCatalogListeners();
      }

      const loginBtn = document.getElementById('loginBtn');
      const headerCustName = document.getElementById('headerCustomerName');

      if (user) {
        if (loginBtn) loginBtn.style.display = 'none';

        // Extract first name (max 12 chars with ellipsis)
        let firstName = '';
        if (user.displayName) {
          firstName = user.displayName.trim().split(/\s+/)[0];
        } else if (user.phoneNumber) {
          firstName = user.phoneNumber.replace('+91', '').trim();
        } else if (user.email) {
          firstName = user.email.split('@')[0];
        }
        const localProf = JSON.parse(localStorage.getItem('ra_customer_profile_' + user.uid) || localStorage.getItem('ra_customer_profile') || '{}');
        if (!firstName && localProf.name) {
          firstName = localProf.name.trim().split(/\s+/)[0];
        }
        if (!firstName) firstName = 'Customer';
        if (firstName.length > 12) firstName = firstName.slice(0, 11) + '…';

        if (headerCustName) {
          headerCustName.innerText = firstName;
          headerCustName.style.display = 'inline-flex';
        }

        loadUserProfileIntoCheckout();
        initUserAccountData(user);

        if (pendingCheckoutAfterLogin) {
          pendingCheckoutAfterLogin = false;
          closeModal('loginModal');
          openCheckout();
        } else if (pendingOrdersAfterLogin) {
          pendingOrdersAfterLogin = false;
          closeModal('loginModal');
          openOrdersModal();
        }
      } else {
        if (loginBtn) {
          loginBtn.style.display = 'inline-block';
          loginBtn.innerText = I18N[currentLang]?.signIn || 'Sign In';
        }
        if (headerCustName) headerCustName.style.display = 'none';
        cachedAddresses = [];
        userOrderStats = { count: 0, lastDate: null };
        updateAccountSignedOutUI();
      }

      if (currentNavTab === 'account') {
        renderAccountView();
      }
    });

    async function loginGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        if (isInApp) {
          await auth.signInWithRedirect(provider);
        } else {
          try {
            await auth.signInWithPopup(provider);
          } catch (popupErr) {
            if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user' || popupErr.code === 'auth/cancelled-popup-request') {
              await auth.signInWithRedirect(provider);
              return;
            }
            throw popupErr;
          }
          closeModal('loginModal');
          if (pendingCheckoutAfterLogin) {
            pendingCheckoutAfterLogin = false;
            openCheckout();
          } else if (pendingOrdersAfterLogin) {
            pendingOrdersAfterLogin = false;
            openOrdersModal();
          }
        }
      } catch (err) {
        showToast('Login error: ' + err.message);
      }
    }

    document.getElementById('loginGoogleSecondaryBtn')?.addEventListener('click', loginGoogle);
    document.getElementById('loginGoogleBtn')?.addEventListener('click', loginGoogle);

    // ========================================================
    // STEP 3: CATALOG PERSISTENCE, CACHE-FIRST HYDRATION & RTDB LISTENERS
    // ========================================================
    const CATALOG_CACHE_KEY = 'ra_store_catalog_cache';
    const CATEGORIES_CACHE_KEY = 'ra_store_categories_cache';
    let productsLoaded = false;
    let catalogTimeoutTimer = null;
    let productsListenerRef = null;
    let categoriesListenerRef = null;

    // STEP 3: Cache-First Hydration from live Firebase local cache (NO mock/dummy static file)
    // Products are fetched strictly live from Firebase Realtime Database collections.
    try {
      const cachedCatalogStr = localStorage.getItem(CATALOG_CACHE_KEY);
      if (cachedCatalogStr) {
        const parsedCatalog = JSON.parse(cachedCatalogStr);
        if (parsedCatalog && typeof parsedCatalog === 'object' && Object.keys(parsedCatalog).length > 0) {
          productsCatalog = parsedCatalog;
          debugLog('rowsReceived', Object.keys(parsedCatalog).length + ' (from localStorage cache)');
        }
      }
      const cachedCategoriesStr = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (cachedCategoriesStr) {
        const parsedCats = JSON.parse(cachedCategoriesStr);
        if (parsedCats && typeof parsedCats === 'object' && Object.keys(parsedCats).length > 0) {
          categoriesCatalog = parsedCats;
        }
      }
      if (Object.keys(productsCatalog).length > 0) {
        renderCategoryChips();
        renderProducts();
      }
    } catch (e) {
      console.warn('[RA Store] Error reading catalog cache:', e);
    }

    // Set 8s failsafe timeout
    catalogTimeoutTimer = setTimeout(() => {
      if (!productsLoaded) {
        debugLog('lastError', 'TIMEOUT_8S: 8s elapsed without live database response', true);
        if (Object.keys(productsCatalog).length === 0) {
          showCatalogLoadError();
        }
      }
    }, 8000);

    function initCatalogListeners() {
      debugLog('readStarted', 'Yes (' + new Date().toLocaleTimeString() + ')');

      // 1. Categories listener with error callback
      if (categoriesListenerRef) categoriesListenerRef.off();
      categoriesListenerRef = db.ref('categories');
      categoriesListenerRef.on('value', snap => {
        const val = snap.val() || {};
        categoriesCatalog = val;
        debugLog('categoryCount', Object.keys(val).length);
        try { localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(val)); } catch (e) {}
        renderCategoryChips();
        renderProducts();
      }, err => {
        console.error('[RA Store] Categories listener error:', err);
        debugLog('lastError', (err.code || 'CAT_ERR') + ': ' + (err.message || 'Categories fetch error'), true);
      });

      // 2. Products listener with error callback
      if (productsListenerRef) productsListenerRef.off();
      productsListenerRef = db.ref('products');
      productsListenerRef.on('value', snap => {
        const val = snap.val();
        const count = (val && typeof val === 'object') ? Object.keys(val).length : 0;
        debugLog('rowsReceived', count);
        debugLog('errorCode', 'None');
        debugLog('errorMessage', 'None');

        if (val && typeof val === 'object') {
          productsCatalog = val;
          productsLoaded = true;
          debugLog('productCount', Object.keys(val).length);
          if (catalogTimeoutTimer) clearTimeout(catalogTimeoutTimer);

          // Cache last good catalog in localStorage inside try/catch
          try {
            localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(val));
          } catch (e) {
            console.warn('[RA Store] Error caching catalog:', e);
          }
        } else {
          productsCatalog = {};
          productsLoaded = true;
          if (catalogTimeoutTimer) clearTimeout(catalogTimeoutTimer);
        }

        // Cart auto-revalidation against live products
        let cartChanged = false;
        Object.keys(cart).forEach(id => {
          if (!productsCatalog[id]) {
            delete cart[id];
            cartChanged = true;
          } else if (productsCatalog[id].inStock === false) {
            delete cart[id];
            cartChanged = true;
            showToast(`"${productsCatalog[id].name || 'An item'}" went out of stock and was removed from cart.`);
          }
        });
        if (cartChanged) saveCart();

        renderCategoryChips();
        renderProducts();
        updateCartUI();
        const drawer = document.getElementById('cartDrawerModal');
        if (drawer && drawer.style.display === 'flex') {
          renderCartDrawerItems();
        }
      }, err => {
        console.error('[RA Store] Products listener error:', err);
        debugLog('lastError', (err.code || 'ERR') + ': ' + (err.message || 'Catalog read failed'), true);
        if (!productsLoaded && Object.keys(productsCatalog).length === 0) {
          showCatalogLoadError(err.message);
        }
      });
    }

    // Initialize live listeners immediately
    initCatalogListeners();

    // Re-sync catalog automatically when network returns after being offline
    window.addEventListener('online', () => {
      debugLog('readStarted', 'Reloading (network online event)...');
      showToast('Back online! Refreshing items...');
      initCatalogListeners();
    });

    const lastOrder = JSON.parse(localStorage.getItem('ra_last_order') || 'null');
    if (lastOrder && Array.isArray(lastOrder.items) && lastOrder.items.length) {
      document.getElementById('reorderLastBtn').style.display = 'inline-flex';
    }

    document.getElementById('reorderLastBtn').addEventListener('click', () => {
      if (lastOrder && lastOrder.items) {
        lastOrder.items.forEach(it => {
          if (productsCatalog[it.id] && productsCatalog[it.id].inStock !== false) {
            cart[it.id] = (cart[it.id] || 0) + it.quantity;
          }
        });
        saveCart();
        showToast(I18N[currentLang].itemsAddedToast);
      }
    });

    function getHeaderOffset() {
      const nav = document.querySelector('.navbar');
      const sticky = document.querySelector('.sticky-controls');
      return (nav ? nav.offsetHeight : 57) + (sticky ? sticky.offsetHeight : 95);
    }

    let isUserClickScrolling = false;

    function scrollToCategorySection(catId, shouldBlink = true) {
      if (catId === 'all') {
        isUserClickScrolling = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { isUserClickScrolling = false; }, 800);
        return;
      }

      const sec = document.getElementById(`cat-${catId}`);
      if (sec) {
        isUserClickScrolling = true;
        const offset = getHeaderOffset();
        const rect = sec.getBoundingClientRect();
        const targetY = window.pageYOffset + rect.top - offset - 8;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

        if (shouldBlink) {
          sec.classList.remove('section-blink');
          void sec.offsetWidth; // Force reflow
          sec.classList.add('section-blink');
          setTimeout(() => {
            sec.classList.remove('section-blink');
            isUserClickScrolling = false;
          }, 1400);
        } else {
          setTimeout(() => { isUserClickScrolling = false; }, 800);
        }
      }
    }

    function highlightActiveChip(catId) {
      const chips = document.querySelectorAll('#categoryChipsBar .chip');
      chips.forEach(chip => {
        const c = chip.getAttribute('data-cat');
        if (c === catId) {
          chip.classList.add('active');
          chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          chip.classList.remove('active');
        }
      });
    }

    // Scroll-Spy
    let scrollSpyThrottle = null;
    window.addEventListener('scroll', () => {
      if (searchQuery) return; // Scroll-spy off while searching
      if (isUserClickScrolling) return;

      if (scrollSpyThrottle) return;
      scrollSpyThrottle = setTimeout(() => {
        scrollSpyThrottle = null;
        const sections = Array.from(document.querySelectorAll('.category-section'));
        if (!sections.length) return;

        const offset = getHeaderOffset();
        const probeY = offset + 50;
        let activeCat = 'all';

        if (window.pageYOffset < 120) {
          activeCat = 'all';
        } else {
          for (let i = sections.length - 1; i >= 0; i--) {
            const sec = sections[i];
            const rect = sec.getBoundingClientRect();
            if (rect.top <= probeY) {
              activeCat = sec.getAttribute('data-cat-id') || 'all';
              break;
            }
          }
        }

        if (currentCategory !== activeCat) {
          currentCategory = activeCat;
          syncUrlParams();
          highlightActiveChip(activeCat);
        }
      }, 100);
    }, { passive: true });

    function renderCategoryChips() {
      const bar = document.getElementById('categoryChipsBar');
      if (!bar) return;

      // Unknown category fallback: if requested cat doesn't exist, gracefully fall back to 'all'
      if (currentCategory && currentCategory !== 'all' && Object.keys(categoriesCatalog).length > 0) {
        if (!categoriesCatalog[currentCategory]) {
          console.warn('[RA Store] Unknown category:', currentCategory, 'falling back to all items');
          currentCategory = 'all';
          syncUrlParams();
        }
      }

      const catKeys = Object.keys(categoriesCatalog).sort((a,b) => (categoriesCatalog[a].order || 0) - (categoriesCatalog[b].order || 0));
      
      const totalCount = Object.keys(productsCatalog).length;
      let html = `
        <div class="chip ${currentCategory === 'all' ? 'active' : ''}" data-cat="all">
          ${I18N[currentLang].allCategory} <span class="chip-count">(${totalCount})</span>
        </div>
      `;

      catKeys.forEach(k => {
        const cat = categoriesCatalog[k];
        if (cat.active === false) return;
        const count = Object.values(productsCatalog).filter(p => p.categoryId === k).length;
        if (count === 0) return;
        const name = (currentLang === 'te' && cat.nameTe) ? cat.nameTe : cat.name;
        html += `
          <div class="chip ${currentCategory === k ? 'active' : ''}" data-cat="${escapeHtml(k)}">
            ${escapeHtml(cat.icon || '🏷️')} ${escapeHtml(name)} <span class="chip-count">(${count})</span>
          </div>
        `;
      });

      bar.innerHTML = html;
      if (currentCategory && currentCategory !== 'all' && categoriesCatalog[currentCategory]) {
        setTimeout(() => scrollToCategorySection(currentCategory, false), 150);
      }
    }

    document.getElementById('categoryChipsBar').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) {
        const cat = chip.getAttribute('data-cat');
        if (!cat) return;
        currentCategory = cat;
        highlightActiveChip(cat);
        syncUrlParams();
        scrollToCategorySection(cat, true);
      }
    });

    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const val = searchInput.value.trim();
      searchClearBtn.style.display = val ? 'block' : 'none';

      searchTimeout = setTimeout(() => {
        searchQuery = val.toLowerCase();
        syncUrlParams();
        renderProducts();
      }, 250);
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      syncUrlParams();
      renderProducts();
    });

    function syncUrlParams() {
      const url = new URL(window.location);
      if (currentCategory && currentCategory !== 'all') url.searchParams.set('cat', currentCategory);
      else url.searchParams.delete('cat');

      if (searchQuery) url.searchParams.set('q', searchQuery);
      else url.searchParams.delete('q');

      history.replaceState(null, '', url);
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('cat')) currentCategory = urlParams.get('cat');
    if (urlParams.get('q')) {
      searchQuery = urlParams.get('q').toLowerCase();
      searchInput.value = urlParams.get('q');
      searchClearBtn.style.display = 'block';
    }

    // Handle redirect return from Razorpay callback (WhatsApp / UPI apps)
    if (urlParams.get('order_success')) {
      const successOrderId = urlParams.get('order_success');
      cart = {};
      saveCart();
      updateCartUI();
      setTimeout(() => {
        showToast(`Payment received! Order #${successOrderId} confirmed.`);
      }, 500);
      try {
        history.replaceState(null, '', window.location.pathname);
      } catch (e) {}
    } else if (urlParams.get('payment_status')) {
      const pStatus = urlParams.get('payment_status');
      if (pStatus === 'failed' || pStatus === 'invalid_signature') {
        setTimeout(() => {
          showToast('Payment was not completed. You can retry from Your Orders.', 'danger');
        }, 500);
      } else if (pStatus === 'pending_verification') {
        setTimeout(() => {
          showToast('Payment verification in progress. Please check Your Orders in a moment.');
        }, 500);
      }
      try {
        history.replaceState(null, '', window.location.pathname);
      } catch (e) {}
    }

    // Shared Lazy Image IntersectionObserver
    let sharedLazyObserver = null;
    function observeLazyImages() {
      if (window.IntersectionObserver) {
        if (!sharedLazyObserver) {
          sharedLazyObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                const imgId = img.getAttribute('data-img-id');
                const imgV = img.getAttribute('data-img-v');
                if (imgId) {
                  loadProductImageLazily(imgId, imgV);
                  obs.unobserve(img);
                }
              }
            });
          }, { rootMargin: '200px' });
        }
        document.querySelectorAll('img[data-img-lazy="true"]').forEach(img => {
          sharedLazyObserver.observe(img);
        });
      } else {
        Object.keys(productsCatalog).forEach(id => {
          const p = productsCatalog[id];
          if (p && p.hasImage && !getCachedProductImage(id, p.imageVersion)) {
            loadProductImageLazily(id, p.imageVersion);
          }
        });
      }
    }

    function renderProductControlsHtml(id, p) {
      if (!p) p = productsCatalog[id];
      if (!p) return '';
      const inCart = cart[id] || 0;
      const isOutOfStock = p.inStock === false;
      if (isOutOfStock) {
        return `<button class="btn btn-outline" disabled style="padding: 6px 10px; font-size: 11px; opacity: 0.6; min-height: 40px;">${I18N[currentLang].outOfStock}</button>`;
      }
      if (inCart === 0) {
        return `<button class="btn btn-primary action-add-cart" data-id="${escapeHtml(id)}">${I18N[currentLang].addBtn}</button>`;
      }
      return `
        <div class="qty-stepper-wrap">
          <button class="btn btn-outline action-qty" data-id="${escapeHtml(id)}" data-delta="-1" aria-label="Decrease quantity">-</button>
          <span class="qty-display">${inCart}</span>
          <button class="btn btn-outline action-qty" data-id="${escapeHtml(id)}" data-delta="1" aria-label="Increase quantity">+</button>
        </div>
      `;
    }

    function updateProductCardControls(id) {
      const el = document.getElementById(`prodControls-${id}`);
      if (el) {
        el.innerHTML = renderProductControlsHtml(id, productsCatalog[id]);
      }
    }

    function renderProductCardHtml(id) {
      const p = productsCatalog[id];
      if (!p) return '';
      const isOutOfStock = p.inStock === false;
      const displayName = (currentLang === 'te' && p.nameTe) ? p.nameTe : p.name;
      
      let displayImg = SVG_PLACEHOLDER;
      let needsLazyLoad = false;
      if (p.hasImage) {
        const cached = getCachedProductImage(id, p.imageVersion);
        if (cached) {
          displayImg = cached;
        } else {
          displayImg = SVG_PLACEHOLDER;
          needsLazyLoad = true;
        }
      } else {
        displayImg = safeImage(p.image || p.imageUrl || p.imageURL || '');
      }

      // MRP & Discount calculation
      let mrpHtml = '';
      let discountHtml = '';
      if (p.mrp && Number(p.mrp) > Number(p.price)) {
        const disc = Math.round(((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100);
        mrpHtml = `<span class="product-mrp">₹${escapeHtml(p.mrp)}</span>`;
        discountHtml = `<span class="discount-pill">${disc}% OFF</span>`;
      }

      return `
        <div class="card" id="card-${escapeHtml(id)}" style="${isOutOfStock ? 'opacity: 0.75;' : ''}">
          ${isOutOfStock ? `<span class="out-of-stock-badge">${I18N[currentLang].outOfStock}</span>` : discountHtml}
          <div class="product-img-wrap" data-action="zoom-image" data-id="${escapeHtml(id)}" title="Tap to zoom">
            <img class="product-img product-img-${escapeHtml(id)}" ${needsLazyLoad ? `data-img-lazy="true" data-img-id="${escapeHtml(id)}" data-img-v="${escapeHtml(p.imageVersion || '')}"` : ''} loading="lazy" width="140" height="140" src="${displayImg}" alt="${escapeHtml(displayName)}" onerror="handleProductImgError(this);">
          </div>
          <div class="product-info">
            <div class="product-title">${escapeHtml(displayName)}</div>
            <div class="product-unit">${escapeHtml(p.unit || '1 pack')}</div>
          </div>
          <div class="product-bottom-row">
            <div class="product-price-wrap">
              <div>
                <span class="product-price">₹${escapeHtml(p.price)}</span>
                ${mrpHtml}
              </div>
            </div>
            
            <div class="product-controls-container" id="prodControls-${escapeHtml(id)}">
              ${renderProductControlsHtml(id, p)}
            </div>
          </div>
        </div>
      `;
    }

    // SKELETON PLACEHOLDERS DURING INITIAL LOAD
    const SKELETON_CARDS_HTML = `
      <div class="card skeleton-card" aria-hidden="true">
        <div class="skeleton-box skeleton-img"></div>
        <div class="skeleton-box" style="width: 80%; height: 13px; margin-top: 8px;"></div>
        <div class="skeleton-box" style="width: 45%; height: 11px; margin-top: 6px;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <div class="skeleton-box" style="width: 35px; height: 16px;"></div>
          <div class="skeleton-box" style="width: 55px; height: 38px; border-radius: 8px;"></div>
        </div>
      </div>
      <div class="card skeleton-card" aria-hidden="true">
        <div class="skeleton-box skeleton-img"></div>
        <div class="skeleton-box" style="width: 75%; height: 13px; margin-top: 8px;"></div>
        <div class="skeleton-box" style="width: 50%; height: 11px; margin-top: 6px;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <div class="skeleton-box" style="width: 35px; height: 16px;"></div>
          <div class="skeleton-box" style="width: 55px; height: 38px; border-radius: 8px;"></div>
        </div>
      </div>
      <div class="card skeleton-card" aria-hidden="true">
        <div class="skeleton-box skeleton-img"></div>
        <div class="skeleton-box" style="width: 85%; height: 13px; margin-top: 8px;"></div>
        <div class="skeleton-box" style="width: 40%; height: 11px; margin-top: 6px;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <div class="skeleton-box" style="width: 35px; height: 16px;"></div>
          <div class="skeleton-box" style="width: 55px; height: 38px; border-radius: 8px;"></div>
        </div>
      </div>
      <div class="card skeleton-card" aria-hidden="true">
        <div class="skeleton-box skeleton-img"></div>
        <div class="skeleton-box" style="width: 70%; height: 13px; margin-top: 8px;"></div>
        <div class="skeleton-box" style="width: 55%; height: 11px; margin-top: 6px;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <div class="skeleton-box" style="width: 35px; height: 16px;"></div>
          <div class="skeleton-box" style="width: 55px; height: 38px; border-radius: 8px;"></div>
        </div>
      </div>
    `;

    function showCatalogLoadError(customMsg) {
      const gridContainer = document.getElementById('productsGrid');
      if (!gridContainer) return;
      // If we already have cached products rendered, do not destroy them
      if (Object.keys(productsCatalog).length > 0) return;

      const t = I18N[currentLang] || I18N.en;
      gridContainer.className = 'grid';
      gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; padding: 40px 16px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 10px;">⚠️</div>
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">${escapeHtml(t.couldNotLoadItems || "Couldn't load items")}</h3>
          <p style="font-size: 12px; color: var(--muted); margin-bottom: 16px;">${customMsg ? escapeHtml(customMsg) : 'Please check your connection and retry.'}</p>
          <button type="button" class="btn btn-primary" id="retryCatalogLoadBtn" style="min-height: 42px; padding: 8px 20px; font-weight: 700;">
            🔄 ${escapeHtml(t.retryBtn || "Retry")}
          </button>
        </div>
      `;
      document.getElementById('retryCatalogLoadBtn')?.addEventListener('click', retryCatalogFetch);
    }

    function retryCatalogFetch() {
      const gridContainer = document.getElementById('productsGrid');
      if (gridContainer && Object.keys(productsCatalog).length === 0) {
        gridContainer.innerHTML = SKELETON_CARDS_HTML;
      }
      productsLoaded = false;
      if (catalogTimeoutTimer) clearTimeout(catalogTimeoutTimer);
      catalogTimeoutTimer = setTimeout(() => {
        if (!productsLoaded && Object.keys(productsCatalog).length === 0) showCatalogLoadError();
      }, 8000);
      initCatalogListeners();
    }

    function renderProducts() {
      const gridContainer = document.getElementById('productsGrid');
      if (!gridContainer) return;

      // Filter out invalid/malformed product entries safely
      const rawKeys = Object.keys(productsCatalog);
      let allKeys = rawKeys.filter(id => {
        const p = productsCatalog[id];
        if (!p || typeof p !== 'object') {
          console.warn('[RA Store] Skipping invalid product object:', id);
          return false;
        }
        const price = Number(p.price);
        if (isNaN(price) || price < 0) {
          console.warn('[RA Store] Skipping product with invalid price:', id, p);
          return false;
        }
        return true;
      });

      debugLog('rowsAfterFilter', allKeys.length);

      // True empty catalog handling
      if (allKeys.length === 0 && !searchQuery) {
        if (!productsLoaded) {
          // Still waiting for initial response and no cache yet
          return;
        }
        const t = I18N[currentLang] || I18N.en;
        gridContainer.className = 'grid';
        gridContainer.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1; padding: 40px 16px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 10px;">📦</div>
            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">${escapeHtml(t.noItemsAvailable || "No items available right now")}</h3>
            <p style="font-size: 12px; color: var(--muted);">Please check back in a few minutes.</p>
          </div>
        `;
        debugLog('cardsAppended', '0 (Empty catalog)');
        return;
      }

      if (searchQuery) {
        // Flat search results
        const matches = allKeys.filter(id => {
          const p = productsCatalog[id];
          const nameEn = (p.name || '').toLowerCase();
          const nameTe = (p.nameTe || '').toLowerCase();
          const keywords = (p.keywords || '').toLowerCase();
          const cat = (categoriesCatalog[p.categoryId]?.name || '').toLowerCase();
          const catTe = (categoriesCatalog[p.categoryId]?.nameTe || '').toLowerCase();

          return nameEn.includes(searchQuery) ||
                 nameTe.includes(searchQuery) ||
                 keywords.includes(searchQuery) ||
                 cat.includes(searchQuery) ||
                 catTe.includes(searchQuery);
        });

        if (!matches.length) {
          if (!loggedMisses.has(searchQuery)) {
            loggedMisses.add(searchQuery);
            db.ref('searchMisses').push({
              term: searchQuery,
              category: currentCategory,
              timestamp: new Date().toISOString()
            }).catch(() => {});
          }

          const askMsg = encodeURIComponent(`Hello RA Store! Do you have "${searchQuery}" in stock in Anantapur?`);
          gridContainer.className = 'grid';
          gridContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
              <div class="empty-icon">🔍</div>
              <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">No items found for "${escapeHtml(searchQuery)}"</h3>
              <p style="font-size: 12px; color: var(--muted); margin-bottom: 16px;">We might have it in the store or can procure it for you!</p>
              <a href="https://wa.me/${storeSettings.whatsappNumber}?text=${askMsg}" target="_blank" class="btn" style="background: #25D366; color: #fff; text-decoration: none; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;">
                Ask Store on WhatsApp
              </a>
            </div>
          `;
          return;
        }

        gridContainer.className = 'grid';
        gridContainer.innerHTML = matches.map(id => renderProductCardHtml(id)).join('');
        observeLazyImages();
        return;
      }

      // Grouped by Category in admin-defined order
      gridContainer.className = 'products-container';
      const catKeys = Object.keys(categoriesCatalog).sort((a,b) => (categoriesCatalog[a].order || 0) - (categoriesCatalog[b].order || 0));

      const categorizedProductIds = new Set();
      let sectionsHtml = '';

      catKeys.forEach(k => {
        const cat = categoriesCatalog[k];
        if (cat.active === false) return;
        const catProducts = allKeys.filter(id => productsCatalog[id].categoryId === k);
        if (!catProducts.length) return;

        catProducts.forEach(id => categorizedProductIds.add(id));
        const name = (currentLang === 'te' && cat.nameTe) ? cat.nameTe : (cat.name || 'Category');

        sectionsHtml += `
          <section id="cat-${escapeHtml(k)}" class="category-section" data-cat-id="${escapeHtml(k)}">
            <div class="category-section-header">
              <span>${escapeHtml(cat.icon || '🏷️')} ${escapeHtml(name)}</span>
              <span style="font-size: 12px; font-weight: normal; color: var(--muted);">${catProducts.length} items</span>
            </div>
            <div class="grid">
              ${catProducts.map(id => renderProductCardHtml(id)).join('')}
            </div>
          </section>
        `;
      });

      // Products with no valid category -> "Other" section
      const otherProducts = allKeys.filter(id => !categorizedProductIds.has(id));
      if (otherProducts.length) {
        sectionsHtml += `
          <section id="cat-other" class="category-section" data-cat-id="other">
            <div class="category-section-header">
              <span>📦 ${currentLang === 'te' ? 'ఇతర వస్తువులు' : 'Other Items'}</span>
              <span style="font-size: 12px; font-weight: normal; color: var(--muted);">${otherProducts.length} items</span>
            </div>
            <div class="grid">
              ${otherProducts.map(id => renderProductCardHtml(id)).join('')}
            </div>
          </section>
        `;
      }

      if (!sectionsHtml) {
        gridContainer.className = 'grid';
        const t = I18N[currentLang] || I18N.en;
        gridContainer.innerHTML = `<p style="padding: 20px; color: var(--muted); text-align: center; grid-column: 1 / -1;">${escapeHtml(t.noItemsAvailable || "No items available right now")}</p>`;
        return;
      }

      gridContainer.innerHTML = sectionsHtml;
      observeLazyImages();

      // Debug panel metrics update
      const totalCards = gridContainer.querySelectorAll('.card:not(.skeleton-card)').length;
      debugLog('cardsAppended', totalCards + ' cards rendered');
      requestAnimationFrame(() => {
        const firstCard = gridContainer.querySelector('.card:not(.skeleton-card)');
        const cardH = firstCard ? Math.round(firstCard.getBoundingClientRect().height) : 0;
        debugLog('firstCardHeight', cardH + 'px');
      });
    }

    // Tap to Zoom Image Handler
    function showImageZoom(productId) {
      const p = productsCatalog[productId];
      if (!p) return;
      const displayName = (currentLang === 'te' && p.nameTe) ? p.nameTe : p.name;
      
      let imgUrl = SVG_PLACEHOLDER;
      if (p.hasImage) {
        const cached = getCachedProductImage(productId, p.imageVersion);
        if (cached) imgUrl = cached;
      } else {
        imgUrl = safeImage(p.image || p.imageUrl || p.imageURL || '');
      }

      document.getElementById('zoomModalImg').src = imgUrl;
      document.getElementById('zoomModalImg').alt = displayName;
      document.getElementById('imageZoomTitle').innerText = displayName;
      document.getElementById('imageZoomUnit').innerText = p.unit || '1 pack';
      document.getElementById('imageZoomPrice').innerText = `₹${p.price}`;
      openModal('imageZoomModal');
    }

    document.getElementById('productsGrid').addEventListener('click', (e) => {
      const zoomTarget = e.target.closest('[data-action="zoom-image"]');
      if (zoomTarget && !e.target.closest('.btn') && !e.target.closest('.qty-stepper-wrap')) {
        const id = zoomTarget.getAttribute('data-id');
        if (id) showImageZoom(id);
        return;
      }

      const addBtn = e.target.closest('.action-add-cart');
      if (addBtn) { const e = { target: addBtn };
        const id = e.target.getAttribute('data-id');
        cart[id] = 1;
        saveCart(id);
      }
      const qtyBtn = e.target.closest('.action-qty');
      if (qtyBtn) { const e = { target: qtyBtn };
        const id = e.target.getAttribute('data-id');
        const delta = parseInt(e.target.getAttribute('data-delta')) || 0;
        const currentQty = cart[id] || 0;
        const maxLimit = (productsCatalog[id] && productsCatalog[id].maxQuantity) || 20;
        if (delta > 0 && currentQty >= maxLimit) {
          showToast(`Maximum ${maxLimit} items per product allowed.`);
          return;
        }
        cart[id] = currentQty + delta;
        if (cart[id] <= 0) delete cart[id];
        saveCart(id);
      }
    });

    function saveCart(updatedProductId) {
      localStorage.setItem('ra_store_cart', JSON.stringify(cart));
      updateCartUI();
      if (updatedProductId) {
        updateProductCardControls(updatedProductId);
      } else {
        document.querySelectorAll('.product-controls-container').forEach(el => {
          const pid = el.id.replace('prodControls-', '');
          if (pid) el.innerHTML = renderProductControlsHtml(pid, productsCatalog[pid]);
        });
      }
    }

    function updateCartUI() {
      let count = 0;
      let subtotal = 0;
      Object.keys(cart).forEach(k => {
        const qty = cart[k];
        const item = productsCatalog[k];
        count += qty;
        if (item) subtotal += (Number(item.price) * qty);
      });

      // Header cart badge update
      const bnavBadge = document.getElementById('bnavCartBadge');
      if (bnavBadge) {
        if (count > 0) {
          bnavBadge.innerText = count > 99 ? '99+' : count;
          bnavBadge.style.display = 'inline-flex';
        } else {
          bnavBadge.style.display = 'none';
        }
      }
      const headerBadge = document.getElementById('headerCartBadge');
      if (headerBadge) {
        if (count > 0) {
          headerBadge.innerText = count > 99 ? '99+' : count;
          headerBadge.style.display = 'inline-flex';
        } else {
          headerBadge.style.display = 'none';
        }
      }

      // Bottom floating bar update
      const bar = document.getElementById('cartBottomBar');
      const contactWrap = document.getElementById('floatingContactWrap');
      if (count > 0) {
        bar.style.display = 'flex';
        if (contactWrap) contactWrap.classList.add('with-cart-bar');
        const viewCartHint = `<span style="font-size: 11px; font-weight: 600; color: var(--primary); text-decoration: underline; margin-left: 4px;">${I18N[currentLang].viewCartText}</span>`;
        document.getElementById('cartSummaryText').innerHTML = `${count} Items • ₹${subtotal} ${viewCartHint}`;
        const freeThresh = storeSettings.freeDeliveryThreshold ?? 299;
        if (subtotal >= freeThresh) {
          document.getElementById('freeDeliveryNotice').innerText = I18N[currentLang].freeDelNotice;
        } else {
          document.getElementById('freeDeliveryNotice').innerText = I18N[currentLang].moreForFree.replace('{val}', freeThresh - subtotal);
        }
      } else {
        bar.style.display = 'none';
        if (contactWrap) contactWrap.classList.remove('with-cart-bar');
      }

      const fee = subtotal >= (storeSettings.freeDeliveryThreshold ?? 299) ? 0 : (storeSettings.deliveryFee ?? 25);
      document.getElementById('modalSubtotal').innerText = `₹${subtotal}`;
      document.getElementById('modalDelivery').innerText = fee === 0 ? I18N[currentLang].free : `₹${fee}`;
      document.getElementById('modalTotal').innerText = `₹${subtotal + fee}`;

      // Live update Cart Drawer if currently open
      const drawer = document.getElementById('cartDrawerModal');
      if (drawer && drawer.style.display === 'flex') {
        renderCartDrawerItems();
      }
    }

    // Cart Drawer Rendering
    function renderCartDrawerItems() {
      const list = document.getElementById('cartDrawerItemsList');
      const footer = document.getElementById('cartDrawerFooter');
      const progressWrap = document.getElementById('cartFreeDeliveryBarWrap');
      const countBadge = document.getElementById('cartDrawerItemCountBadge');
      const itemKeys = Object.keys(cart);

      let totalQty = 0;
      let subtotal = 0;

      itemKeys.forEach(id => {
        const qty = cart[id];
        totalQty += qty;
        const p = productsCatalog[id];
        if (p) subtotal += (Number(p.price) * qty);
      });

      countBadge.innerText = (currentLang === 'te' ? I18N.te.itemsCount : I18N.en.itemsCount).replace('{n}', totalQty);

      if (itemKeys.length === 0) {
        progressWrap.style.display = 'none';
        footer.style.display = 'none';
        list.innerHTML = `
          <div class="empty-state" style="padding: 30px 10px;">
            <div class="empty-icon">🛒</div>
            <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">${I18N[currentLang].emptyCartMsg}</h4>
            <p style="font-size: 12px; color: var(--muted); margin-bottom: 16px;">${I18N[currentLang].emptyCartSub}</p>
            <button type="button" class="btn btn-primary modal-close-btn action-start-shopping" id="emptyCartShopBtn" data-modal="cartDrawerModal" style="padding: 8px 18px; min-height: 44px;">${I18N[currentLang].startShopping}</button>
          </div>
        `;
        return;
      }

      progressWrap.style.display = 'block';
      footer.style.display = 'block';

      // Free delivery progress calculation
      const freeThresh = storeSettings.freeDeliveryThreshold ?? 299;
      const deliveryFee = subtotal >= freeThresh ? 0 : (storeSettings.deliveryFee ?? 25);
      const percent = Math.min(100, Math.round((subtotal / freeThresh) * 100));

      document.getElementById('cartFreeDeliveryProgressFill').style.width = `${percent}%`;
      document.getElementById('cartFreeDeliveryPercent').innerText = `${percent}%`;
      if (subtotal >= freeThresh) {
        document.getElementById('cartFreeDeliveryMsg').innerText = I18N[currentLang].freeDelNotice;
      } else {
        document.getElementById('cartFreeDeliveryMsg').innerText = I18N[currentLang].moreForFree.replace('{val}', freeThresh - subtotal);
      }

      // Bill totals in drawer
      document.getElementById('cartDrawerSubtotal').innerText = `₹${subtotal}`;
      document.getElementById('cartDrawerDeliveryFee').innerText = deliveryFee === 0 ? I18N[currentLang].free : `₹${deliveryFee}`;
      document.getElementById('cartDrawerTotal').innerText = `₹${subtotal + deliveryFee}`;

      // Item rows
      list.innerHTML = itemKeys.map(id => {
        const qty = cart[id];
        const p = productsCatalog[id] || { name: 'Item', price: 0, unit: '' };
        const displayName = (currentLang === 'te' && p.nameTe) ? p.nameTe : p.name;
        const itemTotal = Number(p.price) * qty;

        let displayImg = SVG_PLACEHOLDER;
        if (p.hasImage) {
          const cached = getCachedProductImage(id, p.imageVersion);
          if (cached) displayImg = cached;
        } else {
          displayImg = safeImage(p.image || p.imageUrl || p.imageURL || '');
        }

        return `
          <div class="cart-item-row">
            <img class="cart-item-img product-img-${escapeHtml(id)}" src="${displayImg}" alt="${escapeHtml(displayName)}" onerror="handleProductImgError(this);">
            <div class="cart-item-details">
              <div class="cart-item-title">${escapeHtml(displayName)}</div>
              <div class="cart-item-unit">${escapeHtml(p.unit || '')} • ₹${escapeHtml(p.price)}</div>
              <div class="cart-item-price">₹${itemTotal}</div>
            </div>
            <div class="cart-item-actions">
              <div class="qty-stepper-wrap">
                <button class="btn btn-outline action-drawer-qty" data-id="${escapeHtml(id)}" data-delta="-1" aria-label="Decrease quantity" style="min-width: 44px; min-height: 44px; font-size: 16px; font-weight: 700; padding: 0;">-</button>
                <span class="qty-display" style="min-width: 18px; font-size: 13px;">${qty}</span>
                <button class="btn btn-outline action-drawer-qty" data-id="${escapeHtml(id)}" data-delta="1" aria-label="Increase quantity" style="min-width: 44px; min-height: 44px; font-size: 16px; font-weight: 700; padding: 0;">+</button>
              </div>
              <button class="action-drawer-remove" data-id="${escapeHtml(id)}" title="Remove item" aria-label="Remove item" style="background: none; border: none; font-size: 16px; color: var(--muted); cursor: pointer; padding: 6px 4px; min-width: 36px; min-height: 36px; display: inline-flex; align-items: center; justify-content: center;">🗑️</button>
            </div>
          </div>
        `;
      }).join('');
    }

    function openCartDrawer() {
      renderCartDrawerItems();
      openModal('cartDrawerModal');
    }

    document.getElementById('cartNavBtn')?.addEventListener('click', openCartDrawer);

    document.getElementById('cartBottomBarSummary').addEventListener('click', openCartDrawer);

    document.getElementById('cartDrawerItemsList').addEventListener('click', (e) => {
      if (e.target && e.target.id === 'removeOosBtn') {
        const oos = Object.keys(cart).filter(id => productsCatalog[id] && productsCatalog[id].inStock === false);
        oos.forEach(id => delete cart[id]);
        saveCart();
        renderCartDrawerItems();
        showToast((currentLang === 'te') ? 'స్టాక్ లేని వస్తువులు తొలగించబడ్డాయి.' : 'Out of stock items removed.');
        return;
      }
      const qtyBtn = e.target.closest('.action-drawer-qty');
      if (qtyBtn) {
        const id = qtyBtn.getAttribute('data-id');
        const delta = parseInt(qtyBtn.getAttribute('data-delta')) || 0;
        const currentQty = cart[id] || 0;
        const maxLimit = (productsCatalog[id] && productsCatalog[id].maxQuantity) || 20;
        if (delta > 0 && currentQty >= maxLimit) {
          showToast(`Maximum ${maxLimit} items per product allowed.`);
          return;
        }
        cart[id] = currentQty + delta;
        if (cart[id] <= 0) delete cart[id];
        saveCart();
        renderCartDrawerItems();
        return;
      }

      const removeBtn = e.target.closest('.action-drawer-remove');
      if (removeBtn) {
        const id = removeBtn.getAttribute('data-id');
        delete cart[id];
        saveCart();
        renderCartDrawerItems();
        return;
      }
    });

    document.getElementById('cartDrawerClearBtn').addEventListener('click', () => {
      if (confirm(I18N[currentLang].clearConfirm)) {
        cart = {};
        saveCart();
        renderCartDrawerItems();
        showToast(I18N[currentLang].cartCleared);
      }
    });

    document.getElementById('cartDrawerCheckoutBtn').addEventListener('click', () => {
      const drawer = document.getElementById('cartDrawerModal');
      if (drawer) drawer.style.display = 'none';
      openCheckout();
    });

    // ==========================================
    // Checkout Bottom Sheet & Profile Loading
    // ==========================================
    function loadUserProfileIntoCheckout() {
      if (!currentUser) return;
      const savedLocal = JSON.parse(localStorage.getItem('ra_customer_profile_' + currentUser.uid) || localStorage.getItem('ra_customer_profile') || '{}');
      
      const phoneInput = document.getElementById('custPhone');
      const nameInput = document.getElementById('custName');
      const addressInput = document.getElementById('custAddress');

      if (currentUser.phoneNumber) {
        const digits = currentUser.phoneNumber.replace('+91', '');
        phoneInput.value = savedLocal.phone || digits;
      } else if (savedLocal.phone) {
        phoneInput.value = savedLocal.phone;
      }

      if (savedLocal.name) {
        nameInput.value = savedLocal.name;
      } else if (currentUser.displayName) {
        nameInput.value = currentUser.displayName;
      }

      if (savedLocal.address) {
        addressInput.value = savedLocal.address;
      }

      // Also read from Firebase Realtime Database users node (with graceful fallback)
      db.ref('users/' + currentUser.uid + '/profile').once('value').then(snap => {
        const val = snap.val();
        if (val) {
          if (val.name && !nameInput.value) nameInput.value = val.name;
          if (val.phone && !phoneInput.value) phoneInput.value = val.phone;
          if (val.address && !addressInput.value) addressInput.value = val.address;
        }
      }).catch(() => {});
    }

    function updateCheckoutSummary() {
      let count = 0;
      let subtotal = 0;
      const itemNames = [];

      Object.keys(cart).forEach(id => {
        const qty = cart[id];
        count += qty;
        const p = productsCatalog[id];
        if (p) {
          subtotal += (Number(p.price) * qty);
          const name = (currentLang === 'te' && p.nameTe) ? p.nameTe : p.name;
          itemNames.push(`${name} (${qty})`);
        }
      });

      document.getElementById('checkoutItemCount').innerText = `${count} items`;
      document.getElementById('checkoutMiniItemsList').innerText = itemNames.join(' • ') || 'No items selected';

      const fee = subtotal >= (storeSettings.freeDeliveryThreshold ?? 299) ? 0 : (storeSettings.deliveryFee ?? 25);
      document.getElementById('modalSubtotal').innerText = `₹${subtotal}`;
      document.getElementById('modalDelivery').innerText = fee === 0 ? I18N[currentLang].free : `₹${fee}`;
      document.getElementById('modalTotal').innerText = `₹${subtotal + fee}`;
    }

    // Payment method selector card interactivity
    const payCardOnline = document.getElementById('payCardOnline');
    const payCardCod = document.getElementById('payCardCod');

    function selectPaymentMethod(method) {
      const onlineRadio = document.querySelector('input[name="payMethod"][value="online_razorpay"]');
      const codRadio = document.querySelector('input[name="payMethod"][value="cod"]');
      
      if (method === 'online_razorpay') {
        onlineRadio.checked = true;
        payCardOnline.classList.add('active');
        payCardCod.classList.remove('active');
      } else {
        codRadio.checked = true;
        payCardCod.classList.add('active');
        payCardOnline.classList.remove('active');
      }
    }

    payCardOnline.addEventListener('click', () => selectPaymentMethod('online_razorpay'));
    payCardCod.addEventListener('click', () => selectPaymentMethod('cod'));

    // Quick landmark chips click
    
    document.getElementById('landmarkChipsContainer')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.landmark-chip');
      if (chip) {
        const val = chip.getAttribute('data-val');
        const input = document.getElementById('custAddress');
        if (input && val) {
          if (!input.value.trim()) {
            input.value = val;
          } else if (!input.value.includes(val)) {
            input.value += ', ' + val;
          }
          input.focus();
        }
      }
    });



    let checkoutSessionRequestId = null;

    function showCheckoutNotice(html, type = 'info') {
      const el = document.getElementById('checkoutNoticeMsg');
      if (!el) return;
      el.innerHTML = html;
      el.className = 'checkout-notice';
      if (type === 'danger') {
        el.style.background = '#FEE2E2';
        el.style.borderColor = '#FECACA';
        el.style.color = '#B91C1C';
      } else if (type === 'warning') {
        el.style.background = '#FEF3C7';
        el.style.borderColor = '#FDE68A';
        el.style.color = '#B45309';
      } else {
        el.style.background = '#EFF6FF';
        el.style.borderColor = '#BFDBFE';
        el.style.color = '#1E40AF';
      }
      el.style.display = 'block';
    }

    function hideCheckoutNotice() {
      const el = document.getElementById('checkoutNoticeMsg');
      if (el) el.style.display = 'none';
    }

    function openCheckout() {
      if (Object.keys(cart).length === 0) {
        showToast("Your cart is empty!");
        return;
      }

      if (!currentUser) {
        pendingCheckoutAfterLogin = true;
        openLoginModal();
        return;
      }

      checkoutSessionRequestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      hideCheckoutNotice();
      loadUserProfileIntoCheckout();
      updateCheckoutSummary();
      openModal('checkoutModal');
    }

    document.getElementById('checkoutBtn').addEventListener('click', openCheckout);

    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) {
        pendingCheckoutAfterLogin = true;
        openLoginModal();
        return;
      }

      const submitBtn = document.getElementById('placeOrderSubmitBtn');
      hideCheckoutNotice();

      const items = Object.keys(cart).map(id => ({ id, quantity: cart[id] }));
      if (!items.length) {
        showCheckoutNotice("Your cart is empty!", 'danger');
        return;
      }
      
      let deliveryNotes = (document.getElementById('custNotes')?.value || '').trim();
      let scheduledSlotInfo = null;
      if (!isStoreCurrentlyOpen) {
        scheduledSlotInfo = getNextDeliverySlotString();
        deliveryNotes = (deliveryNotes ? deliveryNotes + ' • ' : '') + `[Scheduled Delivery: ${scheduledSlotInfo}]`;
      }

      // Phone normalization (strip spaces, symbols, international +91 or leading 0)
      let rawPhone = (document.getElementById('custPhone')?.value || '').trim().replace(/\D/g, '');
      if (rawPhone.length === 12 && rawPhone.startsWith('91')) {
        rawPhone = rawPhone.slice(2);
      } else if (rawPhone.length === 11 && rawPhone.startsWith('0')) {
        rawPhone = rawPhone.slice(1);
      }

      const custName = (document.getElementById('custName')?.value || '').trim();
      const custAddress = (document.getElementById('custAddress')?.value || '').trim();

      // Form validation
      if (custName.length < 2) {
        showCheckoutNotice(I18N[currentLang]?.validNameErr || 'Please enter your full name (at least 2 characters).', 'danger');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(rawPhone)) {
        showCheckoutNotice(I18N[currentLang]?.validPhoneErr || 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9', 'danger');
        return;
      }
      if (custAddress.length < 10) {
        showCheckoutNotice(I18N[currentLang]?.validAddressErr || 'Please enter a complete delivery address with landmark in Anantapur (min 10 characters).', 'danger');
        return;
      }

      // Check 6-digit PIN code if present in address
      const pinMatch = custAddress.match(/\\b(\\d{6})\\b/);
      if (pinMatch) {
        const pin = pinMatch[1];
        const validPins = ['515001', '515002', '515003', '515004', '515005'];
        if (!validPins.includes(pin)) {
          showCheckoutNotice(I18N[currentLang]?.invalidPinErr || ('Delivery is currently available only in Anantapur city (515001 - 515005). PIN ' + pin + ' is outside our service area.'), 'danger');
          return;
        }
      }

      submitBtn.disabled = true;
      submitBtn.innerText = "Securing order...";

      const customer = {
        name: custName,
        phone: rawPhone,
        address: custAddress,
        notes: deliveryNotes,
        scheduledSlot: scheduledSlotInfo,
        geo: capturedLocation || null
      };

      // Save user profile locally & to Firebase under users node
      localStorage.setItem('ra_customer_profile', JSON.stringify({
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      }));
      localStorage.setItem('ra_customer_profile_' + currentUser.uid, JSON.stringify({
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      }));

      if (currentUser && currentUser.uid) {
        db.ref('users/' + currentUser.uid + '/profile').set({
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }

      const payMethodEl = document.querySelector('input[name="payMethod"]:checked');
      const payMethod = payMethodEl ? payMethodEl.value : 'cod';
      if (!checkoutSessionRequestId) {
        checkoutSessionRequestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      }

      // Compute client totals
      let clientSubtotal = 0;
      const verifiedItems = items.map(it => {
        const p = productsCatalog[it.id] || {};
        const unitPrice = Number(p.price || 0);
        clientSubtotal += (unitPrice * it.quantity);
        return {
          id: it.id,
          name: p.name || 'Grocery Item',
          nameTe: p.nameTe || '',
          price: unitPrice,
          quantity: it.quantity,
          unit: p.unit || 'unit'
        };
      });

      const freeThresh = storeSettings.freeDeliveryThreshold ?? 299;
      const deliveryFee = (clientSubtotal >= freeThresh) ? 0 : (storeSettings.deliveryFee ?? 25);
      const clientTotal = clientSubtotal + deliveryFee;

      try {
        let token = '';
        if (currentUser) {
          try { token = await currentUser.getIdToken(); } catch (e) {}
        }

        let orderCreatedOnServer = false;
        let serverData = null;

        // 1. Attempt authoritative order creation via Worker API
        try {
          const res = await fetch(`${WORKER_API}/api/create-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              items,
              customer,
              paymentMethod: payMethod,
              requestId: checkoutSessionRequestId
            })
          });

          if (res.ok) {
            serverData = await res.json();
            orderCreatedOnServer = true;
          } else {
            const errJson = await res.json().catch(() => ({}));
            console.warn('[RA Store] Worker API rejected order:', errJson);
            if (errJson.code === 'OUT_OF_STOCK' || errJson.code === 'MIN_ORDER_NOT_MET' || errJson.code === 'PIN_NOT_SERVICED') {
              showCheckoutNotice(errJson.error || 'Server rejected order.', 'danger');
              submitBtn.disabled = false;
              submitBtn.innerText = isStoreCurrentlyOpen ? (I18N[currentLang]?.confirmOrderBtn || 'Confirm & Place Order') : (I18N[currentLang]?.scheduleForMorning || 'Schedule for Morning Delivery');
              return;
            }
          }
        } catch (netErr) {
          console.warn('[RA Store] Worker API network error, falling back to RTDB:', netErr);
        }

        // 2. Handle Server Success
        if (orderCreatedOnServer && serverData && serverData.success) {
          const finalTotal = serverData.total !== undefined ? serverData.total : clientTotal;

          if (payMethod === 'online_razorpay' && serverData.razorpayOrderId) {
            await loadRazorpaySdk();

            const options = {
              key: serverData.razorpayKeyId,
              amount: serverData.amount,
              currency: 'INR',
              name: 'RA Store Anantapur',
              description: `Order #${serverData.orderId}`,
              callback_url: `${WORKER_API}/api/razorpay-callback`,
              redirect: true,
              order_id: serverData.razorpayOrderId,
              modal: {
                ondismiss: function () {
                  submitBtn.disabled = false;
                  submitBtn.innerText = I18N[currentLang]?.confirmOrderBtn || 'Confirm & Place Order';
                  const heldHtml = `
                    <div style="font-weight: 700; margin-bottom: 4px;">⚠️ ${I18N[currentLang]?.orderHeldNotice || 'Order payment pending'}</div>
                    <div style="font-size: 12px; margin-bottom: 10px;">Order #${escapeHtml(serverData.orderId)} • ₹${escapeHtml(finalTotal)}</div>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" class="btn btn-primary" id="retryPayBtn" style="flex: 1; padding: 10px; font-size: 13px; min-height: 44px;">${I18N[currentLang]?.payNowBtn || 'Pay Now'}</button>
                      <button type="button" class="btn btn-outline" id="cancelHeldOrderBtn" style="flex: 1; padding: 10px; font-size: 13px; min-height: 44px; color: var(--danger); border-color: var(--danger);">Cancel</button>
                    </div>
                  `;
                  showCheckoutNotice(heldHtml, 'warning');
                  document.getElementById('retryPayBtn')?.addEventListener('click', () => {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Opening payment…";
                    rzp.open();
                  });
                  document.getElementById('cancelHeldOrderBtn')?.addEventListener('click', () => {
                    closeModal('checkoutModal');
                  });
                }
              },
              handler: async function (response) {
                showCheckoutNotice(I18N[currentLang]?.confirmingPayment || 'Confirming your payment...', 'info');
                let verified = false;
                try {
                  let verifyHeaders = { 'Content-Type': 'application/json' };
                  if (currentUser) {
                    try {
                      const verifyToken = await currentUser.getIdToken();
                      verifyHeaders['Authorization'] = `Bearer ${verifyToken}`;
                    } catch (e) {}
                  }
                  const verifyRes = await fetch(`${WORKER_API}/api/verify-payment`, {
                    method: 'POST',
                    headers: verifyHeaders,
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      orderId: serverData.orderId
                    })
                  });
                  const verifyData = await verifyRes.json();
                  if (verifyRes.ok && verifyData.success) {
                    verified = true;
                    cart = {};
                    saveCart();
                    closeModal('checkoutModal');
                    showOrderSuccess(serverData.orderId, customer, finalTotal);
                    return;
                  }
                } catch (err) {
                  console.warn('Verify fetch failed, listening to DB', err);
                }

                // Fallback: listen to Firebase RTDB for up to 60s
                if (!verified) {
                  const orderKey = serverData.pushKey || serverData.orderId;
                  const statusRef = db.ref('orders/' + orderKey + '/paymentStatus');
                  let confirmed = false;
                  const timer = setTimeout(() => {
                    if (!confirmed) {
                      statusRef.off('value', onStatus);
                      submitBtn.disabled = false;
                      submitBtn.innerText = I18N[currentLang]?.confirmOrderBtn || 'Confirm & Place Order';
                      const helpline = (storeSettings && storeSettings.whatsappNumber) || '916281730144';
                      showCheckoutNotice(I18N[currentLang]?.paymentFailedContact?.replace('{phone}', helpline) || 'Payment verification pending. Please contact store: ' + helpline, 'danger');
                    }
                  }, 60000);

                  const onStatus = (snap) => {
                    if (snap.val() === 'paid') {
                      confirmed = true;
                      clearTimeout(timer);
                      statusRef.off('value', onStatus);
                      cart = {};
                      saveCart();
                      closeModal('checkoutModal');
                      showOrderSuccess(serverData.orderId, customer, finalTotal);
                    }
                  };
                  statusRef.on('value', onStatus);
                }
              },
              prefill: {
                name: customer.name,
                contact: customer.phone,
                email: currentUser.email || ''
              },
              theme: { color: '#0C831F' }
            };

            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (resp) {
              submitBtn.disabled = false;
              submitBtn.innerText = isStoreCurrentlyOpen ? (I18N[currentLang]?.confirmOrderBtn || 'Confirm & Place Order') : (I18N[currentLang]?.scheduleForMorning || 'Schedule for Morning Delivery');
              showCheckoutNotice("Payment failed: " + (resp.error?.description || "Transaction declined. Cart preserved."), 'danger');
            });
            rzp.open();
          } else {
            // Cash on Delivery via Worker
            cart = {};
            saveCart();
            closeModal('checkoutModal');
            showOrderSuccess(serverData.orderId, customer, finalTotal);
            return;
          }
        } else if (payMethod === 'cod') {
          // 3. Resilient Direct Firebase RTDB fallback for COD
          const pushKey = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const humanOrderId = `RA-${Math.floor(1000 + Math.random() * 9000)}`;
          const fallbackOrder = {
            id: humanOrderId,
            uid: currentUser.uid,
            userEmail: currentUser.email || '',
            customer: customer,
            items: verifiedItems,
            subtotal: clientSubtotal,
            deliveryFee: deliveryFee,
            total: clientTotal,
            paymentMethod: 'cod',
            paymentStatus: 'cod_pending',
            status: 'placed',
            requestId: checkoutSessionRequestId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await db.ref('orders/' + pushKey).set(fallbackOrder);
          cart = {};
          saveCart();
          closeModal('checkoutModal');
          showOrderSuccess(humanOrderId, customer, clientTotal);
          return;
        } else {
          showCheckoutNotice('Could not reach payment gateway. Please select Cash on Delivery or retry in a moment.', 'danger');
          submitBtn.disabled = false;
          submitBtn.innerText = isStoreCurrentlyOpen ? (I18N[currentLang]?.confirmOrderBtn || 'Confirm & Place Order') : (I18N[currentLang]?.scheduleForMorning || 'Schedule for Morning Delivery');
          return;
        }
      } catch (err) {
        console.error('[RA Store] Order submission error:', err);
        alert('Order Placement Notice: ' + (err.message || 'Network error processing order. Please try again.'));
        showCheckoutNotice('Network error connecting to store server. Please try again.', 'danger');
        submitBtn.disabled = false;
        submitBtn.innerText = isStoreCurrentlyOpen ? (I18N[currentLang]?.confirmOrderBtn || 'Confirm & Place Order') : (I18N[currentLang]?.scheduleForMorning || 'Schedule for Morning Delivery');
      }
    });

    function showOrderSuccess(orderId, customer, total, items) {
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
      }
      checkoutSessionRequestId = null;
      document.getElementById('successOrderIdText').innerText = `Order #${escapeHtml(orderId)}`;
      const slotNote = customer.scheduledSlot ? `\nScheduled Delivery: ${customer.scheduledSlot}` : '';
      const msg = encodeURIComponent(`Hello RA Store! I placed order #${orderId} for ₹${total}.${slotNote}\nName: ${customer.name}\nAddress: ${customer.address}`);
      document.getElementById('successWhatsappLink').href = `https://wa.me/${storeSettings.whatsappNumber}?text=${msg}`;
      openModal('successModal');
    }

    // Phase 3: Order History & Status Timeline Stepper
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
        }

        const stepRanks = {
          placed: 0,
          accepted: 0,
          packed: 1,
          out_for_delivery: 2,
          delivered: 3,
          cancelled: -1
        };

        const t = I18N[currentLang];
        const now = Date.now();

        // Load OTP for out_for_delivery orders
        Object.keys(orders).forEach(k => {
          if (orders[k] && orders[k].status === 'out_for_delivery') {
            db.ref('orderPrivate/' + k).once('value').then(snap => {
              const p = snap.val();
              const el = document.getElementById('otp-code-' + k);
              if (el && p && p.code) {
                el.innerText = p.code;
              }
            }).catch(() => {});
          }
        });

        // 1. Sort all orders strictly newest first -> oldest by creation timestamp (STEP 1.1)
        const orderEntries = Object.entries(orders);
        orderEntries.sort((a, b) => {
          const timeA = a[1].createdAt ? new Date(a[1].createdAt).getTime() : 0;
          const timeB = b[1].createdAt ? new Date(b[1].createdAt).getTime() : 0;
          return timeB - timeA;
        });

        // 2. Keep the most recent order updated for "Reorder Last"
        const mostRecentValidOrder = orderEntries.find(([_, o]) => Array.isArray(o.items) && o.items.length > 0)?.[1];
        if (mostRecentValidOrder) {
          lastOrder = mostRecentValidOrder;
          try {
            localStorage.setItem('ra_last_order', JSON.stringify(mostRecentValidOrder));
          } catch (e) {}
          const reorderBtn = document.getElementById('reorderLastBtn');
          if (reorderBtn) reorderBtn.style.display = 'inline-flex';
        }

        // 3. Partition into Live Orders (placed, accepted, packed, out_for_delivery) and Past Orders (delivered, cancelled)
        const liveEntries = [];
        const pastEntries = [];
        orderEntries.forEach(entry => {
          const st = entry[1].status || 'placed';
          if (st === 'delivered' || st === 'cancelled') {
            pastEntries.push(entry);
          } else {
            liveEntries.push(entry);
          }
        });

        function renderOrderCard(k, o) {
          const st = o.status || 'placed';
          const currentRank = stepRanks[st] !== undefined ? stepRanks[st] : 0;
          const isCancelled = st === 'cancelled';
          const isDelivered = st === 'delivered';
          const canCancel = (st === 'placed' || st === 'accepted' || st === 'packed');

          // Payment badge
          let payBadgeHtml = '';
          if (o.paymentMethod === 'cod') {
            payBadgeHtml = `<span style="background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${t.badgeCod}</span>`;
          } else if (o.paymentStatus === 'paid' || o.paymentStatus === 'cod_collected') {
            payBadgeHtml = `<span style="background: #DCFCE7; color: #166534; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${t.badgePaid}</span>`;
          } else if (o.paymentStatus === 'refund_initiated') {
            payBadgeHtml = `<span style="background: #E0E7FF; color: #3730A3; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${t.badgeRefundInitiated}</span>`;
          } else if (o.paymentStatus === 'refunded') {
            payBadgeHtml = `<span style="background: #E2E8F0; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${t.badgeRefunded}</span>`;
          } else {
            payBadgeHtml = `<span style="background: #FEF3C7; color: #B45309; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">${t.badgeAwaiting}</span>`;
          }

          // Visual stepper timeline
          let timelineHtml = '';
          if (isCancelled) {
            const refundNote = o.paymentStatus === 'refund_initiated' ? ' (Refund Initiated)' : (o.paymentStatus === 'refunded' ? ' (Refunded ✅)' : '');
            timelineHtml = `
              <div style="background: #FEE2E2; border: 1px solid #FECACA; color: var(--danger); padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; margin: 10px 0;">
                ❌ ${t.stepCancelled}${refundNote}
              </div>
            `;
          } else {
            timelineHtml = `
              <div class="order-timeline">
                <div class="timeline-step ${currentRank >= 0 ? 'active' : ''} ${currentRank === 0 ? 'current' : ''}">
                  <div class="step-circle">${currentRank > 0 ? '✓' : '1'}</div>
                  <div class="step-label">${t.stepPlaced}</div>
                </div>
                <div class="timeline-line ${currentRank >= 1 ? 'active' : ''}"></div>
                <div class="timeline-step ${currentRank >= 1 ? 'active' : ''} ${currentRank === 1 ? 'current' : ''}">
                  <div class="step-circle">${currentRank > 1 ? '✓' : '2'}</div>
                  <div class="step-label">${t.stepPacked}</div>
                </div>
                <div class="timeline-line ${currentRank >= 2 ? 'active' : ''}"></div>
                <div class="timeline-step ${currentRank >= 2 ? 'active' : ''} ${currentRank === 2 ? 'current' : ''}">
                  <div class="step-circle">${currentRank > 2 ? '✓' : '3'}</div>
                  <div class="step-label">${t.stepOut}</div>
                </div>
                <div class="timeline-line ${currentRank >= 3 ? 'active' : ''}"></div>
                <div class="timeline-step ${currentRank >= 3 ? 'active' : ''} ${currentRank === 3 ? 'current' : ''}">
                  <div class="step-circle">${currentRank >= 3 ? '✓' : '4'}</div>
                  <div class="step-label">${t.stepDelivered}</div>
                </div>
              </div>
            `;
          }

          // Online pending order expiry countdown and Pay Now
          const isPendingOnline = (o.paymentMethod === 'online_razorpay' && o.paymentStatus === 'pending' && !isCancelled && !isDelivered);
          const orderCreatedMs = new Date(o.createdAt).getTime() || now;
          const expiresMs = o.expiresAt ? new Date(o.expiresAt).getTime() : (orderCreatedMs + 15 * 60 * 1000);
          const isExpired = isPendingOnline && (now > expiresMs);
          const remainingSecs = Math.max(0, Math.floor((expiresMs - now) / 1000));
          const remMins = Math.floor(remainingSecs / 60);
          const remSecs = remainingSecs % 60;

          let pendingActionHtml = '';
          if (isPendingOnline) {
            if (isExpired) {
              pendingActionHtml = `
                <div style="background: #FEE2E2; border: 1px solid #FECACA; color: var(--danger); padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; margin: 8px 0; display: flex; justify-content: space-between; align-items: center;">
                  <span>⏰ Payment window expired (15m)</span>
                  <span style="font-weight: 700;">${t.expired}</span>
                </div>
              `;
            } else {
              pendingActionHtml = `
                <div style="background: #FEF3C7; border: 1px solid #FDE68A; padding: 8px 12px; border-radius: 8px; margin: 8px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <span style="font-size: 12px; color: #92400E; font-weight: 600;">⏳ Held for: <strong>${remMins}m ${remSecs < 10 ? '0' : ''}${remSecs}s</strong></span>
                  <button type="button" class="btn btn-primary action-pay-now-pending" data-key="${escapeHtml(k)}" data-id="${escapeHtml(o.id)}" data-rzp-order="${escapeHtml(o.razorpayOrderId || '')}" data-total="${escapeHtml(o.total)}" style="font-size: 12px; padding: 6px 14px; min-height: 38px;">
                    ${t.payNowBtn}
                  </button>
                </div>
              `;
            }
          }

          const itemsJson = escapeHtml(JSON.stringify(o.items || []));

          return `
            <div class="order-card-box">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 700; font-size: 14px;">#${escapeHtml(o.id)}</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  ${payBadgeHtml}
                  <span style="font-weight: 700; color: var(--primary); font-size: 15px;">₹${escapeHtml(o.total)}</span>
                </div>
              </div>
              <div style="font-size: 11px; color: var(--muted); margin: 2px 0 6px;">${new Date(o.createdAt).toLocaleString()}</div>
              
              ${timelineHtml}

              ${(st === 'out_for_delivery') ? `
                <div id="otp-box-${escapeHtml(k)}" class="delivery-otp-box" style="background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border: 2px solid #10B981; border-radius: 12px; padding: 14px; margin: 12px 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);">
                  <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                    🔑 ${t.deliveryOtpTitle}
                  </div>
                  <div id="otp-code-${escapeHtml(k)}" style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #065F46; font-family: monospace; margin: 6px 0;">
                    ----
                  </div>
                  <div style="font-size: 11px; color: #047857; font-weight: 600;">
                    ${t.deliveryOtpSub}
                  </div>
                </div>
              ` : ''}

              <div style="font-size: 12px; color: var(--text); background: #F8FAFC; border: 1px solid var(--border); padding: 8px 10px; border-radius: 6px; margin: 8px 0; white-space: pre-wrap; overflow-wrap: anywhere;">
                <span style="font-weight: 700; color: var(--muted); font-size: 11px;">📍 Delivery Address:</span>
                <div>${escapeHtml(o.customer?.address || 'Anantapur')}</div>
                ${o.customer?.notes ? `<div style="font-size: 11px; color: var(--muted); margin-top: 4px;">📝 <strong>Notes:</strong> ${escapeHtml(o.customer.notes)}</div>` : ''}
              </div>

              <div style="font-size: 12px; color: var(--muted); margin: 8px 0;">
                ${(o.items || []).map(i => `${escapeHtml(i.name)} (${i.quantity})`).join(', ')}
              </div>

              ${o.customer?.scheduledSlot ? `
                <div style="font-size: 11px; color: #B45309; background: #FEF3C7; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px;">
                  ⏰ ${escapeHtml(o.customer.scheduledSlot)}
                </div>
              ` : ''}

              ${pendingActionHtml}

              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button class="btn btn-outline action-reorder-past-order" data-order-id="${escapeHtml(o.id)}" data-items="${itemsJson}" style="flex: 1; font-size: 12px; min-height: 38px;">
                  ${t.reorderOrderBtn}
                </button>
                ${canCancel ? `
                  <button class="btn btn-outline action-cancel-my-order" data-key="${escapeHtml(k)}" data-method="${escapeHtml(o.paymentMethod || '')}" data-paystatus="${escapeHtml(o.paymentStatus || '')}" data-total="${escapeHtml(o.total || 0)}" style="color: var(--danger); border-color: var(--danger); font-size: 12px; padding: 4px 10px; min-height: 38px;">
                    ${t.cancelOrderBtn}
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }

        let fullHtml = '';
        if (liveEntries.length > 0) {
          fullHtml += `<div class="orders-group-header" style="font-size: 13px; font-weight: 700; color: var(--primary, #0C831F); margin: 6px 0 10px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>🛵</span> <span>${t.liveOrdersTitle || (currentLang === 'te' ? 'లైవ్ ఆర్డర్లు & ట్రాకింగ్' : 'Live Orders & Live Tracking')}</span>
            </div>
            <span style="font-size: 11px; background: #DCFCE7; color: #166534; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${liveEntries.length} active</span>
          </div>`;
          fullHtml += liveEntries.map(([k, o]) => renderOrderCard(k, o)).join('');
        }

        if (pastEntries.length > 0) {
          if (liveEntries.length > 0) {
            fullHtml += `<div class="orders-group-header" style="font-size: 13px; font-weight: 700; color: #4B5563; margin: 18px 0 10px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span>📦</span> <span>${t.pastOrdersTitle || (currentLang === 'te' ? 'గత ఆర్డర్లు' : 'Past Orders')}</span>
              </div>
              <span style="font-size: 11px; background: #F3F4F6; color: #4B5563; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${pastEntries.length}</span>
            </div>`;
          }
          fullHtml += pastEntries.map(([k, o]) => renderOrderCard(k, o)).join('');
        }

        list.innerHTML = fullHtml;
      });
    }

    document.getElementById('ordersNavBtn')?.addEventListener('click', openOrdersModal);

    document.getElementById('customerOrdersList').addEventListener('click', async (e) => {
      // Reorder button on past orders
      const reorderBtn = e.target.closest('.action-reorder-past-order');
      if (reorderBtn) {
        try {
          const rawItems = reorderBtn.getAttribute('data-items');
          const items = JSON.parse(rawItems || '[]');
          let addedCount = 0;
          items.forEach(it => {
            if (it.id && productsCatalog[it.id] && productsCatalog[it.id].inStock !== false) {
              cart[it.id] = (cart[it.id] || 0) + (it.quantity || 1);
              addedCount++;
            }
          });
          if (addedCount > 0) {
            saveCart();
            showToast(I18N[currentLang].itemsAddedToast);
            closeModal('ordersModal');
            openCartDrawer();
          } else {
            showToast("Sorry, those items are currently out of stock.");
          }
        } catch (err) {
          showToast("Error reordering items.");
        }
        return;
      }

      // Pay Now for pending online order
      const payPendingBtn = e.target.closest('.action-pay-now-pending');
      if (payPendingBtn) {
        const rzpOrderId = payPendingBtn.getAttribute('data-rzp-order');
        const orderId = payPendingBtn.getAttribute('data-id');
        const total = payPendingBtn.getAttribute('data-total');

        if (!rzpOrderId) {
          showToast("Payment link unavailable. Please contact store.");
          return;
        }

        payPendingBtn.disabled = true;
        payPendingBtn.innerText = "Opening…";

        await loadRazorpaySdk();
        const options = {
          key: storeSettings.razorpayKeyId || 'rzp_live_TtGrq3sfJkM0pA',
          amount: Math.round(Number(total) * 100),
          currency: 'INR',
          name: 'RA Store Anantapur',
          description: `Order #${orderId}`,
          order_id: rzpOrderId,
          handler: async function (response) {
            payPendingBtn.innerText = "Confirming…";
            try {
              let verifyHeaders = { 'Content-Type': 'application/json' };
              if (currentUser) {
                try {
                  const verifyToken = await currentUser.getIdToken();
                  verifyHeaders['Authorization'] = `Bearer ${verifyToken}`;
                } catch (e) {}
              }
              const verifyRes = await fetch(`${WORKER_API}/api/verify-payment`, {
                method: 'POST',
                headers: verifyHeaders,
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderId
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                showToast("Payment successful! Order updated.");
              } else {
                showToast("Payment received. Verifying shortly…");
              }
            } catch (err) {
              showToast("Network issue during verification. Will update automatically.");
            }
          },
          prefill: {
            name: currentUser.displayName || '',
            contact: currentUser.phoneNumber || '',
            email: currentUser.email || ''
          },
          theme: { color: '#0C831F' }
        };

        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function () {
          payPendingBtn.disabled = false;
          payPendingBtn.innerText = I18N[currentLang].payNowBtn;
          showToast("Payment declined.");
        });
        rzp.open();
        return;
      }

      // Cancel order button
      const cancelBtn = e.target.closest('.action-cancel-my-order');
      if (cancelBtn) {
        const orderKey = cancelBtn.getAttribute('data-key');
        const payMethod = cancelBtn.getAttribute('data-method');
        const payStatus = cancelBtn.getAttribute('data-paystatus');
        const total = cancelBtn.getAttribute('data-total');
        const t = I18N[currentLang];

        let confirmMsg = '';
        if (payMethod === 'cod') {
          confirmMsg = t.cancelCodConfirm;
        } else if (payStatus === 'paid') {
          confirmMsg = t.cancelPaidConfirm.replace('{amount}', total);
        } else {
          confirmMsg = t.cancelUnpaidConfirm;
        }

        if (!confirm(confirmMsg)) return;
        
        cancelBtn.disabled = true;
        cancelBtn.innerText = "Cancelling…";

        try {
          const token = await currentUser.getIdToken();
          const res = await fetch(`${WORKER_API}/api/cancel-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              orderId: orderKey,
              pushKey: orderKey,
              reason: 'Customer cancelled from My Orders'
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            showToast(payStatus === 'paid' ? 'Order cancelled. 100% refund initiated!' : 'Order cancelled successfully.');
          } else {
            showToast('Cancellation error: ' + (data.error || 'Please contact store.'));
            cancelBtn.disabled = false;
            cancelBtn.innerText = t.cancelOrderBtn;
          }
        } catch (err) {
          showToast('Network issue connecting to server. Please try again.');
          cancelBtn.disabled = false;
          cancelBtn.innerText = t.cancelOrderBtn;
        }
      }
    });

    function openModal(id) {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'flex';
        document.body.classList.add('modal-open');
        document.body.classList.add('overlay-open');
        if (id === 'loginModal') {
          document.body.classList.add('signin-open');
        }
        try {
          history.pushState({ modalId: id }, '');
        } catch (e) {}
        syncBottomBar();
      }
    }

    function closeModal(id, fromPopState = false) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
      if (id === 'loginModal') {
        document.body.classList.remove('signin-open');
      }
      if (id === 'ordersModal' && ordersRef) {
        ordersRef.off();
        ordersRef = null;
      }
      if (id === 'successModal') {
        navigateToHomeTop();
        return;
      }
      if (id === 'cartDrawerModal' || id === 'ordersModal') {
        if (currentNavTab === 'cart' || currentNavTab === 'orders') {
          setActiveNavTab(previousNavTab || 'home', false);
        }
      }
      const anyOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(m => m.style.display === 'flex' || m.style.display === 'block');
      if (!anyOpen) {
        document.body.classList.remove('modal-open');
        if (currentNavTab === 'cart' || currentNavTab === 'orders') {
          setActiveNavTab(previousNavTab || 'home', false);
        }
      }
      if (!fromPopState && history.state && history.state.modalId === id) {
        try {
          history.back();
        } catch (e) {}
      }
      syncBottomBar();
    }

    window.addEventListener('popstate', (e) => {
      const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
      if (openModals.length > 0) {
        const topModal = openModals[openModals.length - 1];
        closeModal(topModal.id, true);
      }
      syncBottomBar();
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.getAttribute('data-modal');
        if (m) closeModal(m);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay.id);
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
        if (openModals.length > 0) {
          closeModal(openModals[openModals.length - 1].id);
        }
        syncBottomBar();
      }
    });

    function showToast(msg) {
      const t = document.getElementById('toastMsg');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    if (currentLang !== 'en') applyLanguage(currentLang);
    else updateCartUI();

    
    document.getElementById('retryCatalogBtn')?.addEventListener('click', () => {
      const errBanner = document.getElementById('catalogErrorBanner');
      if (errBanner) errBanner.style.display = 'none';
      retryCatalogFetch();
    });

    // Help FAB toggle removed per Step 1.2

    // Firebase .info/connected listener
    db.ref('.info/connected').on('value', snap => {
      const isConn = !!snap.val();
      debugLog('backendConnected', isConn ? 'Connected' : 'Disconnected');
      const isOnline = !!snap.val();
      const offlineBanner = document.getElementById('offlineNotice');
      if (offlineBanner) {
        offlineBanner.style.display = isOnline ? 'none' : 'block';
      }
    });

    
    // ========================================================
    // PART C: NAVIGATION CONTROLLER & SCROLL PRESERVATION
    // ========================================================
    let currentNavTab = 'home';
    let previousNavTab = 'home';
    let homeScrollY = 0;

    function setActiveNavTab(tab, updatePrevious = true) {
      if (updatePrevious && tab !== currentNavTab && (currentNavTab === 'home' || currentNavTab === 'account')) {
        previousNavTab = currentNavTab;
      }
      currentNavTab = tab;
      document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        const isActive = (btn.getAttribute('data-tab') === tab);
        btn.classList.toggle('active', isActive);
        if (isActive) {
          btn.setAttribute('aria-current', 'page');
        } else {
          btn.removeAttribute('aria-current');
        }
      });
    }

    // CHANGE 2: Unified navigateToHomeTop (used by Home Tab, Start Shopping & Continue Shopping)
    function navigateToHomeTop() {
      // Close all overlays/modals
      ['cartDrawerModal', 'checkoutModal', 'ordersModal', 'addressModal', 'loginModal', 'successModal', 'imageZoomModal'].forEach(m => {
        const el = document.getElementById(m);
        if (el && (el.style.display === 'flex' || el.style.display === 'block')) {
          el.style.display = 'none';
        }
      });
      document.body.classList.remove('modal-open');
      document.body.classList.remove('overlay-open');
      document.body.classList.remove('signin-open');

      // Switch to Home view
      const accountView = document.getElementById('accountView');
      const homeView = document.getElementById('homeView');
      if (accountView) accountView.style.display = 'none';
      if (homeView) homeView.style.display = 'block';

      // Highlight Home tab green
      setActiveNavTab('home');

      // Reset saved home scroll position
      homeScrollY = 0;

      // Smooth scroll to top of Home so first categories are visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const chipsBar = document.getElementById('categoryChipsBar');
      if (chipsBar) chipsBar.scrollTo({ left: 0, behavior: 'smooth' });

      syncBottomBar();
    }

    
    // Categories Tab (Step 1.3)
    document.getElementById('bnavCategoriesBtn')?.addEventListener('click', () => {
      // Close all modals/overlays
      ['cartDrawerModal', 'checkoutModal', 'ordersModal', 'addressModal', 'loginModal', 'successModal', 'imageZoomModal'].forEach(m => {
        const el = document.getElementById(m);
        if (el && (el.style.display === 'flex' || el.style.display === 'block')) {
          el.style.display = 'none';
        }
      });
      document.body.classList.remove('modal-open', 'overlay-open', 'signin-open');

      // Switch to Home view if on Account view
      const accountView = document.getElementById('accountView');
      const homeView = document.getElementById('homeView');
      if (accountView) accountView.style.display = 'none';
      if (homeView) homeView.style.display = 'block';

      // Highlight Categories tab
      setActiveNavTab('categories');

      // Smoothly scroll to the section where categories and items are shown
      const target = document.getElementById('categoryChipsBar') || document.querySelector('.sticky-controls') || document.getElementById('productsGrid');
      const nav = document.querySelector('.navbar');
      const sticky = document.querySelector('.sticky-controls');
      const navHeight = nav ? nav.offsetHeight : 57;
      const stickyHeight = sticky ? sticky.offsetHeight : 80;
      const headerOffset = navHeight + (sticky && sticky !== target ? stickyHeight : 0);

      if (target) {
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 8;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }

      syncBottomBar();
    });

    // Home Tab
    document.getElementById('bnavHomeBtn')?.addEventListener('click', () => {
      if (currentNavTab !== 'home') {
        navigateToHomeTop();
      } else {
        // Already on Home: smooth-scroll to top so first categories are in view & reset chips
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const chipsBar = document.getElementById('categoryChipsBar');
        if (chipsBar) chipsBar.scrollTo({ left: 0, behavior: 'smooth' });
        homeScrollY = 0;
      }
    });

    // CHANGE 2: Delegated clicks for Start Shopping & Continue Shopping
    document.addEventListener('click', (e) => {
      const startShop = e.target.closest('#emptyCartShopBtn, .action-start-shopping');
      if (startShop) {
        e.preventDefault();
        navigateToHomeTop();
        return;
      }
      const continueShop = e.target.closest('#successContinueShopBtn, .action-continue-shopping');
      if (continueShop) {
        e.preventDefault();
        navigateToHomeTop();
        return;
      }
    });

    // Cart Tab
    document.getElementById('bnavCartBtn')?.addEventListener('click', () => {
      if (currentNavTab === 'home') {
        homeScrollY = window.scrollY || window.pageYOffset || 0;
      }
      // Close other modals first
      ['ordersModal', 'addressModal', 'loginModal'].forEach(m => {
        const el = document.getElementById(m);
        if (el && el.style.display === 'flex') closeModal(m);
      });
      setActiveNavTab('cart');
      openCartDrawer();
    });

    // Orders Tab
    document.getElementById('bnavOrdersBtn')?.addEventListener('click', () => {
      if (currentNavTab === 'home') {
        homeScrollY = window.scrollY || window.pageYOffset || 0;
      }
      // Close other modals first
      ['cartDrawerModal', 'addressModal'].forEach(m => {
        const el = document.getElementById(m);
        if (el && el.style.display === 'flex') closeModal(m);
      });
      setActiveNavTab('orders');

      if (!currentUser) {
        pendingOrdersAfterLogin = true;
        openModal('loginModal');
      } else {
        openOrdersModal();
      }
    });

    // Account Tab
    document.getElementById('bnavAccountBtn')?.addEventListener('click', () => {
      if (currentNavTab === 'home') {
        homeScrollY = window.scrollY || window.pageYOffset || 0;
      }
      // Close any open overlays
      ['cartDrawerModal', 'ordersModal', 'addressModal', 'loginModal'].forEach(m => {
        const el = document.getElementById(m);
        if (el && (el.style.display === 'flex' || el.style.display === 'block')) {
          closeModal(m);
        }
      });

      document.getElementById('homeView').style.display = 'none';
      document.getElementById('accountView').style.display = 'block';
      setActiveNavTab('account');
      renderAccountView();
      window.scrollTo({ top: 0, behavior: 'auto' });

      try {
        history.pushState({ tab: 'account' }, '');
      } catch (e) {}
    });

    // Header Customer Name click -> open Account tab
    document.getElementById('headerCustomerName')?.addEventListener('click', () => {
      document.getElementById('bnavAccountBtn')?.click();
    });

    // Account view Sign In button
    document.getElementById('accountSignInBtn')?.addEventListener('click', () => {
      openModal('loginModal');
    });

    // Hook modal close to revert bottom nav highlight
    const originalCloseModal = closeModal;
    closeModal = function(id, fromPopState = false) {
      originalCloseModal(id, fromPopState);
      if (currentNavTab === 'cart' || currentNavTab === 'orders') {
        setActiveNavTab(previousNavTab, false);
      }
    };

    // Override popstate to handle Android back button from Account to Home
    window.addEventListener('popstate', (e) => {
      const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => m.style.display === 'flex' || m.style.display === 'block');
      if (openModals.length > 0) {
        // Modal was closed by standard handler
        return;
      }
      if (currentNavTab === 'account') {
        // Android back button: return to Home view
        document.getElementById('accountView').style.display = 'none';
        document.getElementById('homeView').style.display = 'block';
        setActiveNavTab('home');
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(homeScrollY, maxScroll), behavior: 'auto' });
      }
    });

    // ========================================================
    // PART D: ACCOUNT TAB CONTROLLER & SAVED ADDRESSES
    // ========================================================
    let cachedAddresses = [];
    let userOrderStats = { count: 0, lastDate: null };
    let tempAddressGeo = null;

    function initUserAccountData(user) {
      if (!user) return;

      // 1. Listen to saved addresses
      db.ref('users/' + user.uid + '/addresses').on('value', snap => {
        const data = snap.val();
        if (data) {
          cachedAddresses = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        } else {
          cachedAddresses = [];
        }
        localStorage.setItem('ra_customer_addresses_' + user.uid, JSON.stringify(cachedAddresses));
        renderSavedAddressesList();
        renderCheckoutSavedAddressChips();
      });

      // 2. Fetch order stats (Orders Placed & Last Order date)
      db.ref('orders').orderByChild('uid').equalTo(user.uid).once('value', snap => {
        const orders = snap.val();
        if (orders) {
          const list = Object.values(orders);
          userOrderStats.count = list.length;
          const sorted = list.filter(o => o.createdAt).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
          if (sorted.length > 0 && sorted[0].createdAt) {
            try {
              userOrderStats.lastDate = new Date(sorted[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            } catch(e) {
              userOrderStats.lastDate = sorted[0].createdAt.split('T')[0];
            }
          }
        } else {
          userOrderStats = { count: 0, lastDate: null };
        }
        updateAccountStatsUI();
        updateNotificationUI();
        if (user && Notification.permission === 'granted') { registerFcmToken(); }
      });
    }

    function updateAccountStatsUI() {
      const countEl = document.getElementById('statOrdersCount');
      const dateEl = document.getElementById('statLastOrderDate');
      if (countEl) countEl.innerText = userOrderStats.count;
      if (dateEl) dateEl.innerText = userOrderStats.lastDate || (I18N[currentLang]?.noneYet || 'None yet');
    }

    function updateAccountSignedOutUI() {
      const signedInWrap = document.getElementById('accountSignedInWrap');
      const signedOutWrap = document.getElementById('accountSignedOutWrap');
      const logoutSection = document.getElementById('accountLogoutSection');
      if (signedInWrap) signedInWrap.style.display = 'none';
      if (signedOutWrap) signedOutWrap.style.display = 'block';
      if (logoutSection) logoutSection.style.display = 'none';
    }

    function renderAccountView() {
      const signedInWrap = document.getElementById('accountSignedInWrap');
      const signedOutWrap = document.getElementById('accountSignedOutWrap');
      const logoutSection = document.getElementById('accountLogoutSection');
      const storeHoursText = document.getElementById('accountStoreHoursText');

      if (storeHoursText && storeSettings.storeHours) {
        storeHoursText.innerText = `${storeSettings.storeHours.open || '07:00'} - ${storeSettings.storeHours.close || '21:00'} IST`;
      }

      if (currentUser) {
        if (signedInWrap) signedInWrap.style.display = 'block';
        if (signedOutWrap) signedOutWrap.style.display = 'none';
        if (logoutSection) logoutSection.style.display = 'block';

        // Profile card
        const localProf = JSON.parse(localStorage.getItem('ra_customer_profile_' + currentUser.uid) || localStorage.getItem('ra_customer_profile') || '{}');
        const name = localProf.name || currentUser.displayName || 'RA Customer';
        const initial = name.charAt(0).toUpperCase() || 'U';

        let contactStr = '';
        if (currentUser.phoneNumber) contactStr = currentUser.phoneNumber;
        else if (currentUser.email) contactStr = currentUser.email;
        else if (localProf.phone) contactStr = '+91 ' + localProf.phone;

        const avatarEl = document.getElementById('accountAvatar');
        const nameEl = document.getElementById('accountUserName');
        const contactEl = document.getElementById('accountUserContact');

        if (avatarEl) avatarEl.innerText = initial;
        if (nameEl) nameEl.innerText = name;
        if (contactEl) contactEl.innerText = contactStr;

        updateAccountStatsUI();
        renderSavedAddressesList();
      } else {
        updateAccountSignedOutUI();
      }
    }

    // Inline Name Editor
    document.getElementById('btnEditNameToggle')?.addEventListener('click', () => {
      const box = document.getElementById('inlineEditNameBox');
      const input = document.getElementById('inputEditName');
      const curName = document.getElementById('accountUserName')?.innerText || '';
      if (box) {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
        if (box.style.display === 'block' && input) {
          input.value = curName;
          input.focus();
        }
      }
    });

    document.getElementById('btnCancelEditName')?.addEventListener('click', () => {
      const box = document.getElementById('inlineEditNameBox');
      if (box) box.style.display = 'none';
    });

    document.getElementById('btnSaveName')?.addEventListener('click', async () => {
      const input = document.getElementById('inputEditName');
      const newName = input?.value.trim();
      if (!newName || newName.length < 2) {
        showToast('Please enter at least 2 characters');
        return;
      }
      if (currentUser) {
        const localProf = JSON.parse(localStorage.getItem('ra_customer_profile_' + currentUser.uid) || '{}');
        localProf.name = newName;
        localStorage.setItem('ra_customer_profile_' + currentUser.uid, JSON.stringify(localProf));
        localStorage.setItem('ra_customer_profile', JSON.stringify(localProf));

        try {
          await db.ref('users/' + currentUser.uid + '/profile').update({
            name: newName,
            updatedAt: new Date().toISOString()
          });
        } catch(e) {}

        const nameEl = document.getElementById('accountUserName');
        if (nameEl) nameEl.innerText = newName;
        const avatarEl = document.getElementById('accountAvatar');
        if (avatarEl) avatarEl.innerText = newName.charAt(0).toUpperCase();

        const headerName = document.getElementById('headerCustomerName');
        if (headerName) {
          const first = newName.split(/\s+/)[0];
          headerName.innerText = first.length > 12 ? first.slice(0, 11) + '…' : first;
        }

        document.getElementById('inlineEditNameBox').style.display = 'none';
        showToast('Profile name updated!');
      }
    });

    // Saved Addresses Rendering
    function renderSavedAddressesList() {
      const container = document.getElementById('savedAddressesContainer');
      if (!container) return;

      if (!cachedAddresses || cachedAddresses.length === 0) {
        container.innerHTML = `<p style="font-size: 12px; color: var(--muted); margin: 0;">${I18N[currentLang]?.noSavedAddresses || 'No saved addresses yet. Add Home or Shop address for 1-tap checkout.'}</p>`;
        return;
      }

      const t = I18N[currentLang];
      const htmlCards = cachedAddresses.map(addr => {
        const tagIcon = addr.tag === 'home' ? '🏠' : (addr.tag === 'shop' ? '🏪' : '📍');
        const tagText = addr.tag ? addr.tag.toUpperCase() : 'OTHER';
        const isDef = !!addr.isDefault;

        return `
          <div class="address-card ${isDef ? 'is-default' : ''}" data-addr-id="${escapeHtml(addr.id)}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="address-tag-badge">${tagIcon} ${tagText}</span>
                ${isDef ? `<span style="font-size: 10px; font-weight: 700; background: #DCFCE7; color: #166534; padding: 2px 6px; border-radius: 4px;">${t.defaultBadge || 'DEFAULT'}</span>` : ''}
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn btn-light btn-small btn-edit-addr" data-id="${escapeHtml(addr.id)}" style="font-size: 11px; padding: 2px 6px;">✏️</button>
                <button type="button" class="btn btn-light btn-small btn-del-addr" data-id="${escapeHtml(addr.id)}" style="font-size: 11px; padding: 2px 6px; color: var(--danger);">✕</button>
              </div>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text);">${escapeHtml(addr.name || '')} • ${escapeHtml(addr.phone || '')}</div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 2px; line-height: 1.4;">${escapeHtml(addr.address || '')}</div>
            ${addr.geo ? `<div style="font-size: 11px; color: #047857; margin-top: 4px; font-weight: 600;">📍 GPS Saved (~${addr.geo.accuracy || 25}m)</div>` : ''}
            ${!isDef ? `<div style="margin-top: 8px;"><button type="button" class="btn btn-outline btn-small btn-set-default-addr" data-id="${escapeHtml(addr.id)}" style="font-size: 11px; padding: 3px 8px;">${t.setDefaultBtn || 'Set Default'}</button></div>` : ''}
          </div>
        `;
      }).join('');

      container.innerHTML = htmlCards;

      // Attach actions to address cards
      container.querySelectorAll('.btn-set-default-addr').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          if (currentUser && id) {
            const updates = {};
            cachedAddresses.forEach(a => {
              updates[a.id + '/isDefault'] = a.id === id;
            });
            await db.ref('users/' + currentUser.uid + '/addresses').update(updates);
            showToast('Default address updated!');
          }
        });
      });

      container.querySelectorAll('.btn-del-addr').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const confirmMsg = I18N[currentLang]?.deleteAddrConfirm || 'Delete this address?';
          if (!confirm(confirmMsg)) return;
          if (currentUser && id) {
            await db.ref('users/' + currentUser.uid + '/addresses/' + id).remove();
            showToast('Address deleted');
          }
        });
      });

      container.querySelectorAll('.btn-edit-addr').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const addr = cachedAddresses.find(a => a.id === id);
          if (addr) openAddressModalForEdit(addr);
        });
      });
    }

    // Add / Edit Address Modal handling
    document.getElementById('btnAddAddressBtn')?.addEventListener('click', () => {
      openAddressModalForNew();
    });

    function openAddressModalForNew() {
      const form = document.getElementById('addressForm');
      if (form) form.reset();
      document.getElementById('editAddressId').value = '';
      document.getElementById('addressModalTitle').innerText = 'Add New Address';
      tempAddressGeo = null;
      document.getElementById('addrGpsStatus').innerText = 'No GPS saved';
      document.getElementById('addrGpsStatus').style.color = 'var(--muted)';

      // Pre-fill profile name and phone if available
      if (currentUser) {
        const localProf = JSON.parse(localStorage.getItem('ra_customer_profile_' + currentUser.uid) || '{}');
        document.getElementById('addrName').value = localProf.name || currentUser.displayName || '';
        document.getElementById('addrPhone').value = localProf.phone || (currentUser.phoneNumber ? currentUser.phoneNumber.replace('+91','') : '');
      }

      openModal('addressModal');
    }

    function openAddressModalForEdit(addr) {
      document.getElementById('editAddressId').value = addr.id;
      document.getElementById('addressModalTitle').innerText = 'Edit Address';
      const tagRadios = document.querySelectorAll('input[name="addrTag"]');
      tagRadios.forEach(r => { r.checked = (r.value === (addr.tag || 'home')); });

      document.getElementById('addrName').value = addr.name || '';
      document.getElementById('addrPhone').value = addr.phone || '';
      document.getElementById('addrAddress').value = addr.address || '';
      document.getElementById('addrSetDefault').checked = !!addr.isDefault;

      tempAddressGeo = addr.geo || null;
      const gpsStatus = document.getElementById('addrGpsStatus');
      if (tempAddressGeo) {
        gpsStatus.innerText = `✅ GPS Saved (~${tempAddressGeo.accuracy}m)`;
        gpsStatus.style.color = '#047857';
      } else {
        gpsStatus.innerText = 'No GPS saved';
        gpsStatus.style.color = 'var(--muted)';
      }

      openModal('addressModal');
    }

    // Landmark chip clicks in Address Modal
    document.getElementById('addrLandmarkChips')?.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('landmark-chip')) {
        const val = e.target.getAttribute('data-val');
        const txt = document.getElementById('addrAddress');
        if (txt && val) {
          if (!txt.value.includes(val)) {
            txt.value = (txt.value.trim() ? txt.value.trim() + ', ' : '') + val;
          }
        }
      }
    });

    // Capture GPS pin in Address Modal
    document.getElementById('btnPinAddrGps')?.addEventListener('click', () => {
      const btn = document.getElementById('btnPinAddrGps');
      const statusEl = document.getElementById('addrGpsStatus');
      if (!navigator.geolocation) {
        statusEl.innerText = 'GPS not supported';
        return;
      }
      btn.disabled = true;
      statusEl.innerText = 'Acquiring GPS fix…';
      navigator.geolocation.getCurrentPosition(
        pos => {
          btn.disabled = false;
          tempAddressGeo = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          };
          statusEl.innerText = `✅ GPS Saved (~${tempAddressGeo.accuracy}m)`;
          statusEl.style.color = '#047857';
          showToast('GPS coordinates pinned to address!');
        },
        err => {
          btn.disabled = false;
          statusEl.innerText = 'Failed to get GPS';
          statusEl.style.color = 'var(--danger)';
          showToast('Location error: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });

    // Save Address form submit
    document.getElementById('addressForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) {
        showToast('Please sign in to save addresses');
        return;
      }

      const editId = document.getElementById('editAddressId').value;
      const tag = document.querySelector('input[name="addrTag"]:checked')?.value || 'home';
      const name = document.getElementById('addrName').value.trim();
      const phone = document.getElementById('addrPhone').value.trim();
      const address = document.getElementById('addrAddress').value.trim();
      const isDefault = document.getElementById('addrSetDefault').checked;

      if (name.length < 2 || !/^[6-9]\d{9}$/.test(phone) || address.length < 10) {
        showToast('Please fill all required fields properly');
        return;
      }

      const saveBtn = document.getElementById('btnSaveAddress');
      saveBtn.disabled = true;
      saveBtn.innerText = 'Saving…';

      try {
        const addrId = editId || ('addr_' + Date.now());
        const addrData = {
          id: addrId,
          tag,
          name,
          phone,
          address,
          isDefault,
          geo: tempAddressGeo,
          updatedAt: new Date().toISOString()
        };

        const updates = {};
        updates[addrId] = addrData;

        // If setting as default or if this is the only address, ensure others are not default
        if (isDefault || cachedAddresses.length === 0) {
          addrData.isDefault = true;
          cachedAddresses.forEach(a => {
            if (a.id !== addrId) updates[a.id + '/isDefault'] = false;
          });
        }

        await db.ref('users/' + currentUser.uid + '/addresses').update(updates);
        closeModal('addressModal');
        showToast('Address saved successfully!');
      } catch(err) {
        showToast('Error saving address: ' + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Address';
      }
    });

    // Pre-fill default address in Checkout
    function renderCheckoutSavedAddressChips() {
      const wrap = document.getElementById('checkoutSavedAddressChipsWrap');
      const container = document.getElementById('checkoutSavedAddressChips');
      if (!wrap || !container) return;

      if (!cachedAddresses || cachedAddresses.length === 0) {
        wrap.style.display = 'none';
        return;
      }

      wrap.style.display = 'block';
      container.innerHTML = cachedAddresses.map(a => {
        const tagIcon = a.tag === 'home' ? '🏠' : (a.tag === 'shop' ? '🏪' : '📍');
        return `<button type="button" class="btn btn-outline btn-small btn-quick-addr" data-id="${escapeHtml(a.id)}" style="font-size: 11px; padding: 4px 8px; font-weight: 700;">${tagIcon} ${escapeHtml(a.tag?.toUpperCase() || 'ADDR')} ${a.isDefault ? '★' : ''}</button>`;
      }).join('');

      container.querySelectorAll('.btn-quick-addr').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const addr = cachedAddresses.find(a => a.id === id);
          if (addr) applySavedAddressToCheckout(addr);
        });
      });
    }

    function applySavedAddressToCheckout(addr) {
      if (!addr) return;
      document.getElementById('custName').value = addr.name || '';
      document.getElementById('custPhone').value = addr.phone || '';
      document.getElementById('custAddress').value = addr.address || '';

      if (addr.geo) {
        capturedLocation = { lat: addr.geo.lat, lng: addr.geo.lng, accuracy: addr.geo.accuracy };
        const detailsRow = document.getElementById('locationDetailsRow');
        const accText = document.getElementById('locationAccuracyText');
        if (detailsRow) detailsRow.style.display = 'block';
        if (accText) accText.innerText = `✅ Saved address GPS (~${addr.geo.accuracy}m accuracy)`;
        const btn = document.getElementById('btnShareLocation');
        if (btn) btn.innerHTML = `<span>📍</span> <span>${I18N[currentLang]?.updateLocationBtn || "Update location"}</span>`;
      }
      showToast('Address pre-filled from ' + (addr.tag || 'saved address'));
    }

    // Share RA Store
    document.getElementById('btnShareStore')?.addEventListener('click', async () => {
      const shareData = {
        title: 'RA Store — Anantapur Grocery Delivery',
        text: 'Order fresh groceries in Anantapur with fast doorstep delivery from RA Store!',
        url: window.location.origin + '/K-Stores/'
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch(e) {
          if (e.name === 'AbortError') return;
        }
      }
      const text = encodeURIComponent(shareData.text + ' ' + shareData.url);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    });

    // Logout Button in Account view
    document.getElementById('accountLogoutBtn')?.addEventListener('click', async () => {
      const confirmMsg = I18N[currentLang]?.logoutConfirm || 'Log out of RA Store?';
      if (!confirm(confirmMsg)) return;

      try {
        await removeCurrentDeviceToken();
        if (ordersRef) {
          ordersRef.off();
          ordersRef = null;
        }
        await auth.signOut();
        currentUser = null;
        cachedAddresses = [];
        userOrderStats = { count: 0, lastDate: null };

        // Header back to Sign In
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
          loginBtn.style.display = 'inline-block';
          loginBtn.innerText = I18N[currentLang]?.signIn || 'Sign In';
        }
        const custNameEl = document.getElementById('headerCustomerName');
        if (custNameEl) custNameEl.style.display = 'none';

        // Return to Home view
        document.getElementById('accountView').style.display = 'none';
        document.getElementById('homeView').style.display = 'block';
        setActiveNavTab('home');
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(homeScrollY, maxScroll), behavior: 'auto' });

        showToast(I18N[currentLang]?.loggedOutToast || 'Logged out');
      } catch(err) {
        showToast('Logout error: ' + err.message);
      }
    });

    // Delete Account Link in Account view
    document.getElementById('btnDeleteAccount')?.addEventListener('click', async () => {
      const confirmMsg = I18N[currentLang]?.deleteAccountConfirm || 'Are you sure you want to delete your profile and saved addresses? Your past orders will remain in the store records.';
      if (!confirm(confirmMsg)) return;

      try {
        if (currentUser && currentUser.uid) {
          await db.ref('users/' + currentUser.uid + '/profile').remove();
          await db.ref('users/' + currentUser.uid + '/addresses').remove();
          localStorage.removeItem('ra_customer_profile_' + currentUser.uid);
          localStorage.removeItem('ra_customer_addresses_' + currentUser.uid);
          await removeCurrentDeviceToken();
        }
        await auth.signOut();
        currentUser = null;
        cachedAddresses = [];
        userOrderStats = { count: 0, lastDate: null };

        // Header back to Sign In
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
          loginBtn.style.display = 'inline-block';
          loginBtn.innerText = I18N[currentLang]?.signIn || 'Sign In';
        }
        const custNameEl = document.getElementById('headerCustomerName');
        if (custNameEl) custNameEl.style.display = 'none';

        // Return to Home view
        document.getElementById('accountView').style.display = 'none';
        document.getElementById('homeView').style.display = 'block';
        setActiveNavTab('home');
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        window.scrollTo({ top: Math.min(homeScrollY, maxScroll), behavior: 'auto' });

        showToast(I18N[currentLang]?.accountDeletedToast || 'Account data deleted');
      } catch(err) {
        showToast('Error: ' + err.message);
      }
    });

    // ========================================================
    // PART E: "SHARE MY LOCATION" IN DELIVERY DETAILS
    // ========================================================
    let capturedLocation = null;

    async function handleShareLocation() {
      const btn = document.getElementById('btnShareLocation');
      const detailsRow = document.getElementById('locationDetailsRow');
      const errorBox = document.getElementById('locationErrorBox');
      const accuracyText = document.getElementById('locationAccuracyText');
      const t = I18N[currentLang] || {};

      if (!navigator.geolocation) {
        if (errorBox) {
          errorBox.innerText = t.locErrUnsupported || "Geolocation is not supported by your browser.";
          errorBox.style.display = 'block';
        }
        return;
      }

      // Detect in-app browsers
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      const isInApp = /(FBAN|FBAV|Instagram|WhatsApp|Line|TikTok|MicroMessenger|musical_ly|Twitter|Snapchat)/i.test(ua);
      if (isInApp && errorBox) {
        errorBox.innerHTML = `⚠️ ${t.locErrInApp || "In-app browser may block GPS. Tap top-right menu ⋮ → Open in Chrome."}`;
        errorBox.style.display = 'block';
      }

      // Check permissions early if available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'geolocation' });
          if (perm.state === 'denied') {
            if (errorBox) {
              errorBox.innerText = t.locErrDenied || "Location permission denied. Tap the lock icon (🔒) in your address bar → Permissions → Location → Allow, then retry.";
              errorBox.style.display = 'block';
            }
            return;
          }
        } catch(e) {}
      }

      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span> <span>${t.gettingLocation || "Getting location…"}</span>`;
      if (errorBox) errorBox.style.display = 'none';

      function onPosSuccess(pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        capturedLocation = { lat, lng, accuracy };

        btn.disabled = false;
        btn.innerHTML = `<span>📍</span> <span>${t.updateLocationBtn || "Update location"}</span>`;

        if (detailsRow) detailsRow.style.display = 'block';
        if (accuracyText) {
          if (accuracy > 100) {
            accuracyText.innerHTML = `⚠️ ${t.locationApprox?.replace('{acc}', accuracy) || `Location saved (approximate: ~${accuracy}m)`} <button type="button" id="btnRetryLocation" style="background:none; border:none; color:#2563EB; font-weight:700; cursor:pointer; text-decoration:underline; font-size:11px;">${t.tryAgain || "Try again"}</button>`;
            document.getElementById('btnRetryLocation')?.addEventListener('click', handleShareLocation);
          } else {
            accuracyText.innerText = `✅ ${t.locationSaved?.replace('{acc}', accuracy) || `Location saved (~${accuracy}m accuracy)`}`;
          }
        }
      }

      function onPosError(err, didRetry = false) {
        if (!didRetry && (err.code === 3 || err.code === 2)) {
          navigator.geolocation.getCurrentPosition(
            onPosSuccess,
            err2 => onPosError(err2, true),
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
          );
          return;
        }

        btn.disabled = false;
        btn.innerHTML = `<span>📍</span> <span>${t.shareLocationBtn || "Share my location"}</span>`;

        let errMsg = "";
        if (err.code === 1) { // PERMISSION_DENIED
          errMsg = t.locErrDenied || "Location permission denied. Tap the lock icon (🔒) in your address bar → Permissions → Location → Allow, then retry.";
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          errMsg = t.locErrUnavailable || "Position unavailable. Please ensure your device GPS/Location is turned ON and try again.";
        } else if (err.code === 3) { // TIMEOUT
          errMsg = t.locErrTimeout || "Location request timed out. Please move near a window or outdoors and retry.";
        } else {
          errMsg = err.message || "Failed to capture location.";
        }

        if (errorBox) {
          errorBox.innerText = errMsg;
          errorBox.style.display = 'block';
        }
      }

      navigator.geolocation.getCurrentPosition(
        onPosSuccess,
        err => onPosError(err, false),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }

    document.getElementById('btnShareLocation')?.addEventListener('click', handleShareLocation);

    document.getElementById('btnCheckMap')?.addEventListener('click', () => {
      if (capturedLocation) {
        window.open(`https://www.google.com/maps?q=${capturedLocation.lat},${capturedLocation.lng}`, '_blank');
      }
    });

    document.getElementById('btnRemoveLocation')?.addEventListener('click', () => {
      capturedLocation = null;
      const detailsRow = document.getElementById('locationDetailsRow');
      if (detailsRow) detailsRow.style.display = 'none';
      const btn = document.getElementById('btnShareLocation');
      if (btn) btn.innerHTML = `<span>📍</span> <span>${I18N[currentLang]?.shareLocationBtn || "Share my location"}</span>`;
    });


    // ========================================================
    // CHANGE 1: OVERLAY BOTTOM BAR SYNCHRONIZATION (SINGLE SOURCE OF TRUTH)
    // ========================================================
    let syncBottomBarRaf = null;

    function isOverlayOpen(el) {
      if (!el) return false;
      if (el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
      if (el.style.display === 'none') return false;
      if (el.classList.contains('hidden')) return false;
      try {
        const comp = window.getComputedStyle(el);
        if (comp.display === 'none' || comp.visibility === 'hidden' || comp.opacity === '0') return false;
      } catch (e) {}
      return true;
    }

    function syncBottomBar() {
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
          document.body.classList.add('signin-open');
        } else {
          document.body.classList.remove('overlay-open');
          document.body.classList.remove('signin-open');
        }
      });
    }

    // Observe style, class, hidden, aria-hidden across all overlays
    const overlayObserver = new MutationObserver(() => {
      syncBottomBar();
    });
    document.querySelectorAll('.modal-overlay').forEach(el => {
      overlayObserver.observe(el, {
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'aria-hidden']
      });
    });

    // Observe body for dynamically created overlays
    const bodyOverlayObserver = new MutationObserver((mutations) => {
      let shouldSync = false;
      mutations.forEach(m => {
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.nodeType === 1) {
              if (n.classList?.contains('modal-overlay')) {
                overlayObserver.observe(n, { attributes: true, attributeFilter: ['style', 'class', 'hidden', 'aria-hidden'] });
                shouldSync = true;
              } else if (n.querySelector?.('.modal-overlay')) {
                n.querySelectorAll('.modal-overlay').forEach(o => {
                  overlayObserver.observe(o, { attributes: true, attributeFilter: ['style', 'class', 'hidden', 'aria-hidden'] });
                });
                shouldSync = true;
              }
            }
          });
        }
      });
      if (shouldSync) syncBottomBar();
    });
    bodyOverlayObserver.observe(document.body, { childList: true, subtree: true });

    // Failsafe listeners: bar visible on page load & re-synced on visibility, popstate, pageshow
    window.addEventListener('pageshow', () => syncBottomBar());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) syncBottomBar(); });
    window.addEventListener('popstate', () => syncBottomBar());
    window.addEventListener('resize', () => syncBottomBar());

    // Page load initialization
    document.body.classList.remove('overlay-open');
    document.body.classList.remove('signin-open');
    syncBottomBar();

    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        debugLog('swState', 'Active (controlling page)');
      } else {
        debugLog('swState', 'Registering...');
      }
      navigator.serviceWorker.register('./sw.js', { scope: './' }).then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showAppUpdateToast(newWorker);
              }
            });
          }
        });
      }).catch(() => {});

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    function showAppUpdateToast(worker) {
      if (document.getElementById('swUpdateToast')) return;
      const toast = document.createElement('div');
      toast.id = 'swUpdateToast';
      toast.setAttribute('role', 'alert');
      toast.style.cssText = 'position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:#15803d;color:#fff;padding:10px 18px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.28);z-index:9999;display:flex;align-items:center;gap:12px;font-size:13px;font-weight:600;max-width:92%;';
      toast.innerHTML = '<span>⚡ New update available!</span><button id="swRefreshBtn" style="background:#fff;color:#15803d;border:none;padding:6px 14px;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;">Update</button>';
      document.body.appendChild(toast);

      document.getElementById('swRefreshBtn')?.addEventListener('click', () => {
        if (worker) {
          worker.postMessage({ type: 'SKIP_WAITING' });
        }
        toast.remove();
      });
    }

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
        showToast(`${title}: ${body}`);
        
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
        db.ref(`users/${currentUser.uid}/offerHistory/${offerId}/openedAt`).set(new Date().toISOString()).catch(() => {});
        // Also ping backend if available
        fetch(`${WORKER_API}/api/record-offer-open`, {
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

          await db.ref(`users/${currentUser.uid}/fcmTokens/${tokenHash}`).set(tokenRecord);
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
          await db.ref(`users/${currentUser.uid}/fcmTokens/${tokenHash}`).remove();
          localStorage.removeItem('ra_current_fcm_token_hash');
          localStorage.removeItem('ra_current_fcm_token');
          console.log('[FCM] Device token removed');
        } catch (e) {
          console.warn('[FCM] Token removal error:', e);
        }
      }
    }

    function updateNotificationUI() {
      if ('Notification' in window) {
        debugLog('notifPerm', Notification.permission);
      }
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
        db.ref(`users/${currentUser.uid}/notificationPreferences`).once('value', (snap) => {
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
      await db.ref(`users/${currentUser.uid}/notificationPreferences/orderUpdates`).set(checked);
      showToast(checked ? 'Order updates turned on' : 'Order updates paused');
    });

    document.getElementById('toggleNotifOffers')?.addEventListener('change', async (e) => {
      if (!currentUser) return;
      const checked = e.target.checked;
      await db.ref(`users/${currentUser.uid}/notificationPreferences/offersAndReminders`).set(checked);
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


  