const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

console.log('1. Removing #unifiedHelpFab CSS...');
content = content.replace(/\s*#unifiedHelpFab,/g, '');
content = content.replace(/\s*#unifiedHelpFab\s*\{\s*right:[^}]*\}/g, '');

console.log('2. Removing #unifiedHelpFab Markup...');
const fabMarkupRegex = /\s*<!-- Unified Help FAB[\s\S]*?<\/div>\s*<\/div>/;
if (fabMarkupRegex.test(content)) {
  content = content.replace(fabMarkupRegex, '');
  console.log('✅ Removed #unifiedHelpFab HTML markup');
} else {
  console.warn('⚠️ Could not match fabMarkupRegex exactly, checking fallback');
  const fallbackRegex = /<div id="unifiedHelpFab"[\s\S]*?<\/div>\s*<\/div>/;
  content = content.replace(fallbackRegex, '');
}

console.log('3. Removing #unifiedHelpFab JS listener...');
const jsHelpRegex = /\/\/ Help FAB toggle[\s\S]*?document\.addEventListener\('click',\s*\(e\)\s*=>\s*\{[\s\S]*?!e\.target\.closest\('#unifiedHelpFab'\)[\s\S]*?\}\s*\}\);/;
if (jsHelpRegex.test(content)) {
  content = content.replace(jsHelpRegex, '// Help FAB toggle removed per Step 1.2');
  console.log('✅ Removed #unifiedHelpFab JS listener');
} else {
  console.warn('⚠️ Could not match jsHelpRegex exactly');
}

console.log('4. Adding Categories tab to bottom nav HTML...');
const homeBtnPattern = /(<button class="bottom-nav-item active" id="bnavHomeBtn"[\s\S]*?<\/button>)/;
const categoriesBtnHtml = `
    <button class="bottom-nav-item" id="bnavCategoriesBtn" data-tab="categories" aria-label="Categories">
      <span class="bnav-icon-wrap">
        <svg class="bnav-icon bnav-icon-outline" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
        <svg class="bnav-icon bnav-icon-filled" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </span>
      <span class="bnav-label" id="tBnavCategories">Categories</span>
    </button>`;

if (content.includes('id="bnavCategoriesBtn"')) {
  console.log('ℹ️ Categories tab already present');
} else {
  content = content.replace(homeBtnPattern, `$1${categoriesBtnHtml}`);
  console.log('✅ Injected Categories button into bottom nav');
}

console.log('5. Updating bottom-nav CSS for 360px mobile width...');
// Ensure .bottom-nav-item has min-width: 0 and .bnav-label has font-size: 10px and whitespace nowrap
content = content.replace(
  /\.bottom-nav-item\s*\{([^}]*)\}/,
  (match, p1) => {
    let styles = p1;
    if (!styles.includes('min-width')) {
      styles = ' min-width: 0;' + styles;
    }
    return `.bottom-nav-item {${styles}}`;
  }
);
content = content.replace(
  /\.bnav-label\s*\{([^}]*)\}/,
  (match, p1) => {
    let styles = p1;
    styles = styles.replace(/font-size:\s*11px;?/, 'font-size: 10px;');
    if (!styles.includes('white-space')) {
      styles += ' white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;';
    }
    return `.bnav-label {${styles}}`;
  }
);

console.log('6. Adding I18N translations for Categories & Orders grouping...');
// Add bnavCategories, liveOrdersTitle, pastOrdersTitle to English & Telugu
content = content.replace(
  /myOrders:\s*"My Orders",/,
  'myOrders: "My Orders",\n        bnavCategories: "Categories",\n        liveOrdersTitle: "Live Orders & Live Tracking",\n        pastOrdersTitle: "Past Orders",'
);
content = content.replace(
  /myOrders:\s*"నా ఆర్డర్లు",/,
  'myOrders: "నా ఆర్డర్లు",\n        bnavCategories: "కేటగిరీలు",\n        liveOrdersTitle: "లైవ్ ఆర్డర్లు & ట్రాకింగ్",\n        pastOrdersTitle: "గత ఆర్డర్లు",'
);

// Add language switch updater for Categories
content = content.replace(
  /if \(document\.getElementById\('tBnavHome'\)\)[^;]*;/,
  `if (document.getElementById('tBnavHome')) document.getElementById('tBnavHome').innerText = t.bnavHome || (lang === 'te' ? 'హోమ్' : 'Home');
      if (document.getElementById('tBnavCategories')) document.getElementById('tBnavCategories').innerText = t.bnavCategories || (lang === 'te' ? 'కేటగిరీలు' : 'Categories');
      if (document.getElementById('bnavCategoriesBtn')) document.getElementById('bnavCategoriesBtn').setAttribute('aria-label', t.bnavCategories || (lang === 'te' ? 'కేటగిరీలు' : 'Categories'));`
);

console.log('7. Adding Categories click handler...');
const categoriesClickHandler = `
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
`;

if (!content.includes("id='bnavCategoriesBtn'") && !content.includes("id=\"bnavCategoriesBtn\"") || content.includes("// Categories Tab (Step 1.3)")) {
  console.log('ℹ️ Categories click handler check');
} else {
  content = content.replace(
    /\/\/ Home Tab\s*document\.getElementById\('bnavHomeBtn'\)/,
    categoriesClickHandler + '\n    // Home Tab\n    document.getElementById(\'bnavHomeBtn\')'
  );
  console.log('✅ Added Categories Tab click listener');
}

console.log('8. Updating Orders List sorting (Newest first, Live & Past grouping, Reorder Last)...');
// Find ordersRef.on('value', snap => { ... })
const oldOrdersRenderRegex = /ordersRef\.on\('value',\s*snap\s*=>\s*\{[\s\S]*?list\.innerHTML\s*=\s*Object\.keys\(orders\)\.reverse\(\)\.map\(k\s*=>\s*\{[\s\S]*?return\s*`\s*<div class="order-card-box">[\s\S]*?`\s*;\s*\}\)\.join\(''\);\s*\}\);/;

// We will update the inner processing of ordersRef.on('value')
const newOrdersRender = `ordersRef.on('value', snap => {
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
            payBadgeHtml = \`<span style="background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">\${t.badgeCod}</span>\`;
          } else if (o.paymentStatus === 'paid' || o.paymentStatus === 'cod_collected') {
            payBadgeHtml = \`<span style="background: #DCFCE7; color: #166534; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">\${t.badgePaid}</span>\`;
          } else if (o.paymentStatus === 'refund_initiated') {
            payBadgeHtml = \`<span style="background: #E0E7FF; color: #3730A3; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">\${t.badgeRefundInitiated}</span>\`;
          } else if (o.paymentStatus === 'refunded') {
            payBadgeHtml = \`<span style="background: #E2E8F0; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">\${t.badgeRefunded}</span>\`;
          } else {
            payBadgeHtml = \`<span style="background: #FEF3C7; color: #B45309; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700;">\${t.badgeAwaiting}</span>\`;
          }

          // Visual stepper timeline
          let timelineHtml = '';
          if (isCancelled) {
            const refundNote = o.paymentStatus === 'refund_initiated' ? ' (Refund Initiated)' : (o.paymentStatus === 'refunded' ? ' (Refunded ✅)' : '');
            timelineHtml = \`
              <div style="background: #FEE2E2; border: 1px solid #FECACA; color: var(--danger); padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; margin: 10px 0;">
                ❌ \${t.stepCancelled}\${refundNote}
              </div>
            \`;
          } else {
            timelineHtml = \`
              <div class="order-timeline">
                <div class="timeline-step \${currentRank >= 0 ? 'active' : ''} \${currentRank === 0 ? 'current' : ''}">
                  <div class="step-circle">\${currentRank > 0 ? '✓' : '1'}</div>
                  <div class="step-label">\${t.stepPlaced}</div>
                </div>
                <div class="timeline-line \${currentRank >= 1 ? 'active' : ''}"></div>
                <div class="timeline-step \${currentRank >= 1 ? 'active' : ''} \${currentRank === 1 ? 'current' : ''}">
                  <div class="step-circle">\${currentRank > 1 ? '✓' : '2'}</div>
                  <div class="step-label">\${t.stepPacked}</div>
                </div>
                <div class="timeline-line \${currentRank >= 2 ? 'active' : ''}"></div>
                <div class="timeline-step \${currentRank >= 2 ? 'active' : ''} \${currentRank === 2 ? 'current' : ''}">
                  <div class="step-circle">\${currentRank > 2 ? '✓' : '3'}</div>
                  <div class="step-label">\${t.stepOut}</div>
                </div>
                <div class="timeline-line \${currentRank >= 3 ? 'active' : ''}"></div>
                <div class="timeline-step \${currentRank >= 3 ? 'active' : ''} \${currentRank === 3 ? 'current' : ''}">
                  <div class="step-circle">\${currentRank >= 3 ? '✓' : '4'}</div>
                  <div class="step-label">\${t.stepDelivered}</div>
                </div>
              </div>
            \`;
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
              pendingActionHtml = \`
                <div style="background: #FEE2E2; border: 1px solid #FECACA; color: var(--danger); padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; margin: 8px 0; display: flex; justify-content: space-between; align-items: center;">
                  <span>⏰ Payment window expired (15m)</span>
                  <span style="font-weight: 700;">\${t.expired}</span>
                </div>
              \`;
            } else {
              pendingActionHtml = \`
                <div style="background: #FEF3C7; border: 1px solid #FDE68A; padding: 8px 12px; border-radius: 8px; margin: 8px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <span style="font-size: 12px; color: #92400E; font-weight: 600;">⏳ Held for: <strong>\${remMins}m \${remSecs < 10 ? '0' : ''}\${remSecs}s</strong></span>
                  <button type="button" class="btn btn-primary action-pay-now-pending" data-key="\${escapeHtml(k)}" data-id="\${escapeHtml(o.id)}" data-rzp-order="\${escapeHtml(o.razorpayOrderId || '')}" data-total="\${escapeHtml(o.total)}" style="font-size: 12px; padding: 6px 14px; min-height: 38px;">
                    \${t.payNowBtn}
                  </button>
                </div>
              \`;
            }
          }

          const itemsJson = escapeHtml(JSON.stringify(o.items || []));

          return \`
            <div class="order-card-box">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 700; font-size: 14px;">#\${escapeHtml(o.id)}</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                  \${payBadgeHtml}
                  <span style="font-weight: 700; color: var(--primary); font-size: 15px;">₹\${escapeHtml(o.total)}</span>
                </div>
              </div>
              <div style="font-size: 11px; color: var(--muted); margin: 2px 0 6px;">\${new Date(o.createdAt).toLocaleString()}</div>
              
              \${timelineHtml}

              \${(st === 'out_for_delivery') ? \`
                <div id="otp-box-\${escapeHtml(k)}" class="delivery-otp-box" style="background: linear-gradient(135deg, #ECFDF5, #D1FAE5); border: 2px solid #10B981; border-radius: 12px; padding: 14px; margin: 12px 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);">
                  <div style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                    🔑 \${t.deliveryOtpTitle}
                  </div>
                  <div id="otp-code-\${escapeHtml(k)}" style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #065F46; font-family: monospace; margin: 6px 0;">
                    ----
                  </div>
                  <div style="font-size: 11px; color: #047857; font-weight: 600;">
                    \${t.deliveryOtpSub}
                  </div>
                </div>
              \` : ''}

              <div style="font-size: 12px; color: var(--text); background: #F8FAFC; border: 1px solid var(--border); padding: 8px 10px; border-radius: 6px; margin: 8px 0; white-space: pre-wrap; overflow-wrap: anywhere;">
                <span style="font-weight: 700; color: var(--muted); font-size: 11px;">📍 Delivery Address:</span>
                <div>\${escapeHtml(o.customer?.address || 'Anantapur')}</div>
                \${o.customer?.notes ? \`<div style="font-size: 11px; color: var(--muted); margin-top: 4px;">📝 <strong>Notes:</strong> \${escapeHtml(o.customer.notes)}</div>\` : ''}
              </div>

              <div style="font-size: 12px; color: var(--muted); margin: 8px 0;">
                \${(o.items || []).map(i => \`\${escapeHtml(i.name)} (\${i.quantity})\`).join(', ')}
              </div>

              \${o.customer?.scheduledSlot ? \`
                <div style="font-size: 11px; color: #B45309; background: #FEF3C7; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px;">
                  ⏰ \${escapeHtml(o.customer.scheduledSlot)}
                </div>
              \` : ''}

              \${pendingActionHtml}

              <div style="display: flex; gap: 8px; margin-top: 10px;">
                <button class="btn btn-outline action-reorder-past-order" data-order-id="\${escapeHtml(o.id)}" data-items="\${itemsJson}" style="flex: 1; font-size: 12px; min-height: 38px;">
                  \${t.reorderOrderBtn}
                </button>
                \${canCancel ? \`
                  <button class="btn btn-outline action-cancel-my-order" data-key="\${escapeHtml(k)}" data-method="\${escapeHtml(o.paymentMethod || '')}" data-paystatus="\${escapeHtml(o.paymentStatus || '')}" data-total="\${escapeHtml(o.total || 0)}" style="color: var(--danger); border-color: var(--danger); font-size: 12px; padding: 4px 10px; min-height: 38px;">
                    \${t.cancelOrderBtn}
                  </button>
                \` : ''}
              </div>
            </div>
          \`;
        }

        let fullHtml = '';
        if (liveEntries.length > 0) {
          fullHtml += \`<div class="orders-group-header" style="font-size: 13px; font-weight: 700; color: var(--primary, #0C831F); margin: 6px 0 10px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>🛵</span> <span>\${t.liveOrdersTitle || (currentLang === 'te' ? 'లైవ్ ఆర్డర్లు & ట్రాకింగ్' : 'Live Orders & Live Tracking')}</span>
            </div>
            <span style="font-size: 11px; background: #DCFCE7; color: #166534; padding: 2px 8px; border-radius: 12px; font-weight: 700;">\${liveEntries.length} active</span>
          </div>\`;
          fullHtml += liveEntries.map(([k, o]) => renderOrderCard(k, o)).join('');
        }

        if (pastEntries.length > 0) {
          if (liveEntries.length > 0) {
            fullHtml += \`<div class="orders-group-header" style="font-size: 13px; font-weight: 700; color: #4B5563; margin: 18px 0 10px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span>📦</span> <span>\${t.pastOrdersTitle || (currentLang === 'te' ? 'గత ఆర్డర్లు' : 'Past Orders')}</span>
              </div>
              <span style="font-size: 11px; background: #F3F4F6; color: #4B5563; padding: 2px 8px; border-radius: 12px; font-weight: 700;">\${pastEntries.length}</span>
            </div>\`;
          }
          fullHtml += pastEntries.map(([k, o]) => renderOrderCard(k, o)).join('');
        }

        list.innerHTML = fullHtml;
      });`;

// Replace lines from ordersRef.on('value', snap => { down to }); before customerOrdersList click listener
const startMarker = "ordersRef.on('value', snap => {";
const endMarker = "document.getElementById('customerOrdersList').addEventListener('click'";

const sIdx = content.indexOf(startMarker);
const eIdx = content.indexOf(endMarker);

if (sIdx !== -1 && eIdx !== -1 && eIdx > sIdx) {
  content = content.slice(0, sIdx) + newOrdersRender + '\n\n    ' + content.slice(eIdx);
  console.log('✅ Replaced orders list rendering with sorted & grouped implementation');
} else {
  console.error('❌ Could not locate ordersRef.on bounds in index.html');
}

// Update reorderLastBtn listener to always use latest order
const oldReorderLastListener = `    document.getElementById('reorderLastBtn').addEventListener('click', () => {
      if (lastOrder && lastOrder.items) {
        lastOrder.items.forEach(it => {
          if (productsCatalog[it.id] && productsCatalog[it.id].inStock !== false) {
            cart[it.id] = (cart[it.id] || 0) + it.quantity;
          }
        });
        saveCart();
        showToast(I18N[currentLang].itemsAddedToast);
      }
    });`;

const newReorderLastListener = `    document.getElementById('reorderLastBtn').addEventListener('click', () => {
      const orderToReorder = lastOrder || JSON.parse(localStorage.getItem('ra_last_order') || 'null');
      if (orderToReorder && Array.isArray(orderToReorder.items) && orderToReorder.items.length) {
        let addedCount = 0;
        orderToReorder.items.forEach(it => {
          if (productsCatalog[it.id] && productsCatalog[it.id].inStock !== false) {
            cart[it.id] = (cart[it.id] || 0) + it.quantity;
            addedCount++;
          }
        });
        saveCart();
        renderCart();
        updateCartBadge();
        if (addedCount > 0) {
          showToast(I18N[currentLang]?.itemsAddedToast || 'Items added to cart!');
        } else {
          showToast(currentLang === 'te' ? 'సరుకులు ప్రస్తుతం అందుబాటులో లేవు' : 'Items currently out of stock');
        }
      }
    });`;

if (content.includes("document.getElementById('reorderLastBtn').addEventListener('click'")) {
  content = content.replace(oldReorderLastListener, newReorderLastListener);
  console.log('✅ Updated reorderLastBtn listener');
}

// In showOrderSuccess, also update ra_last_order immediately
content = content.replace(
  /function showOrderSuccess\(orderId, customer, total\) \{/,
  `function showOrderSuccess(orderId, customer, total, items) {
      try {
        const orderRecord = { id: orderId, total: total, items: items || Object.values(cart || {}), createdAt: new Date().toISOString() };
        localStorage.setItem('ra_last_order', JSON.stringify(orderRecord));
        lastOrder = orderRecord;
        const reorderBtn = document.getElementById('reorderLastBtn');
        if (reorderBtn) reorderBtn.style.display = 'inline-flex';
      } catch (e) {}`
);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('🎉 Step 1 patch applied successfully to index.html');
