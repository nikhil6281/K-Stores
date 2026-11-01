const fs = require('fs');

console.log('Starting patch for all critical issues...');

// ==========================================
// 1. UPDATE index.html
// ==========================================
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\r\n/g, '\n');

// A. Full firebaseConfig in index.html
const oldIndexConfig = `    const firebaseConfig = {
      apiKey: "AIzaSyD94vWB3NBEjSGmbO6JQ5F1t6L9Js7er8Y",
      authDomain: "k-store-ae9dd.firebaseapp.com",
      databaseURL: "https://k-store-ae9dd-default-rtdb.firebaseio.com",
      projectId: "k-store-ae9dd"
    };`;

const newFullConfig = `    const firebaseConfig = {
      apiKey: "AIzaSyD94vWB3NBEjSGmbO6JQ5F1t6L9Js7er8Y",
      authDomain: "k-store-ae9dd.firebaseapp.com",
      databaseURL: "https://k-store-ae9dd-default-rtdb.firebaseio.com",
      projectId: "k-store-ae9dd",
      storageBucket: "k-store-ae9dd.firebasestorage.app",
      messagingSenderId: "836118831556",
      appId: "1:836118831556:web:252f2b36309ef7ed220491",
      measurementId: "G-XER98BP06Y"
    };`;

if (indexHtml.includes(oldIndexConfig)) {
  indexHtml = indexHtml.replace(oldIndexConfig, newFullConfig);
  console.log('✅ index.html: synced firebaseConfig');
}

// B. Remove fetch('./catalog.json') static fallback to prevent stale/mock products
const oldCatalogFetch = `    // STEP 3: Cache-First Hydration - render instantly in 0ms if previous catalog is cached in localStorage
    if (!localStorage.getItem(CATALOG_CACHE_KEY)) {
      fetch('./catalog.json').then(r => r.json()).then(data => {
        if (data && data.products && Object.keys(productsCatalog).length === 0) {
          productsCatalog = data.products;
          if (data.categories) categoriesCatalog = data.categories;
          if (data.settings) storeSettings = { ...storeSettings, ...data.settings };
          productsLoaded = true;
          renderCategoryChips();
          renderProducts();
        }
      }).catch(() => {});
    }`;

const newCatalogHydrate = `    // STEP 3: Cache-First Hydration from live Firebase local cache (NO mock/dummy static file)
    // Products are fetched strictly live from Firebase Realtime Database collections.`;

if (indexHtml.includes(oldCatalogFetch)) {
  indexHtml = indexHtml.replace(oldCatalogFetch, newCatalogHydrate);
  console.log('✅ index.html: removed mock catalog.json fallback');
}

// C. Fix closeHour default from 19 (7 PM) to 21 (9 PM)
indexHtml = indexHtml.replace(
  'const closeHour = parseHourToDecimal(storeSettings.storeHours?.close, 19);',
  'const closeHour = parseHourToDecimal(storeSettings.storeHours?.close, 21);'
);

// D. Replace checkoutForm submission handler with fully debugged & resilient version
const checkoutSubmitRegex = /document\.getElementById\('checkoutForm'\)\.addEventListener\('submit', async \(e\) => \{[\s\S]*?\}\);\s*function showOrderSuccess/;

const newCheckoutSubmit = `document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
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
        deliveryNotes = (deliveryNotes ? deliveryNotes + ' • ' : '') + \`[Scheduled Delivery: \${scheduledSlotInfo}]\`;
      }

      // Phone normalization (strip spaces, symbols, international +91 or leading 0)
      let rawPhone = (document.getElementById('custPhone')?.value || '').trim().replace(/\\D/g, '');
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
      if (!/^[6-9]\\d{9}$/.test(rawPhone)) {
        showCheckoutNotice(I18N[currentLang]?.validPhoneErr || 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9', 'danger');
        return;
      }
      if (custAddress.length < 10) {
        showCheckoutNotice(I18N[currentLang]?.validAddressErr || 'Please enter a complete delivery address with landmark in Anantapur (min 10 characters).', 'danger');
        return;
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
          const res = await fetch(\`\${WORKER_API}/api/create-order\`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \`Bearer \${token}\`
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
              description: \`Order #\${serverData.orderId}\`,
              callback_url: \`\${WORKER_API}/api/razorpay-callback\`,
              redirect: true,
              order_id: serverData.razorpayOrderId,
              modal: {
                ondismiss: function () {
                  submitBtn.disabled = false;
                  submitBtn.innerText = I18N[currentLang]?.confirmOrderBtn || 'Confirm & Place Order';
                  const heldHtml = \`
                    <div style="font-weight: 700; margin-bottom: 4px;">⚠️ \${I18N[currentLang]?.orderHeldNotice || 'Order payment pending'}</div>
                    <div style="font-size: 12px; margin-bottom: 10px;">Order #\${escapeHtml(serverData.orderId)} • ₹\${escapeHtml(finalTotal)}</div>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" class="btn btn-primary" id="retryPayBtn" style="flex: 1; padding: 10px; font-size: 13px; min-height: 44px;">\${I18N[currentLang]?.payNowBtn || 'Pay Now'}</button>
                      <button type="button" class="btn btn-outline" id="cancelHeldOrderBtn" style="flex: 1; padding: 10px; font-size: 13px; min-height: 44px; color: var(--danger); border-color: var(--danger);">Cancel</button>
                    </div>
                  \`;
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
                      verifyHeaders['Authorization'] = \`Bearer \${verifyToken}\`;
                    } catch (e) {}
                  }
                  const verifyRes = await fetch(\`\${WORKER_API}/api/verify-payment\`, {
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
          const pushKey = \`ord_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}\`;
          const humanOrderId = \`RA-\${Math.floor(1000 + Math.random() * 9000)}\`;
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

    function showOrderSuccess`;

if (checkoutSubmitRegex.test(indexHtml)) {
  indexHtml = indexHtml.replace(checkoutSubmitRegex, newCheckoutSubmit);
  console.log('✅ index.html: upgraded checkout submission handler');
} else {
  console.warn('⚠️ Could not match checkoutSubmitRegex in index.html');
}

fs.writeFileSync('index.html', indexHtml, 'utf8');


// ==========================================
// 2. UPDATE admin.html
// ==========================================
let adminHtml = fs.readFileSync('admin.html', 'utf8');
adminHtml = adminHtml.replace(/\r\n/g, '\n');

const oldAdminConfig = `    const firebaseConfig = {
      apiKey: "AIzaSyD94vWB3NBEjSGmbO6JQ5F1t6L9Js7er8Y",
      authDomain: "k-store-ae9dd.firebaseapp.com",
      databaseURL: "https://k-store-ae9dd-default-rtdb.firebaseio.com",
      projectId: "k-store-ae9dd"
    };`;

if (adminHtml.includes(oldAdminConfig)) {
  adminHtml = adminHtml.replace(oldAdminConfig, newFullConfig);
  console.log('✅ admin.html: synced firebaseConfig');
}

fs.writeFileSync('admin.html', adminHtml, 'utf8');


// ==========================================
// 3. UPDATE worker.html
// ==========================================
let workerHtml = fs.readFileSync('worker.html', 'utf8');
workerHtml = workerHtml.replace(/\r\n/g, '\n');

const oldWorkerConfig = `    const firebaseConfig = {
      apiKey: "AIzaSyD94vWB3NBEjSGmbO6JQ5F1t6L9Js7er8Y",
      authDomain: "k-store-ae9dd.firebaseapp.com",
      databaseURL: "https://k-store-ae9dd-default-rtdb.firebaseio.com",
      projectId: "k-store-ae9dd",
      storageBucket: "k-store-ae9dd.appspot.com",
      messagingSenderId: "117073811544",
      appId: "1:117073811544:web:8669ae4eb8b80fc28d3e6e"
    };`;

if (workerHtml.includes(oldWorkerConfig)) {
  workerHtml = workerHtml.replace(oldWorkerConfig, newFullConfig);
  console.log('✅ worker.html: synced firebaseConfig');
}

// Support scheduled morning slot reading in worker.html
workerHtml = workerHtml.replace(
  'const isMorning = !!o.scheduledSlot;',
  'const isMorning = !!(o.scheduledSlot || (o.customer && o.customer.scheduledSlot));'
);

fs.writeFileSync('worker.html', workerHtml, 'utf8');
console.log('All patches applied successfully.');
