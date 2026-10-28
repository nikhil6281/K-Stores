# RA Store — Targeted Fixes Changelog (CHANGES.md)

This document summarizes every file modified or added across Parts A, B, C, and D.

---

### Files Modified & Added

- `admin.html`:
  - **A1**: Added dedicated Delivery Address block (`16px`, bold, `pre-wrap`, `overflow-wrap: anywhere`) with `📞 Call` (`tel:`), `💬 WhatsApp`, `📋 Copy`, and `🗺️ Maps` (Google Maps search query + "Anantapur"). Displayed delivery notes and morning scheduled slot badge (`⏰ Scheduled Morning Delivery`). Added address, notes, and scheduled slot to the printable bill slip.
  - **A2**: Filtered Live Orders list to display only COD orders and paid online orders (`paymentStatus === 'paid'`). Created collapsed bottom container (`⏳ N awaiting payment`) for unpaid online orders with read-only details and a `Reconcile` button calling the Worker API. Excluded unpaid orders from reports, customer totals, and new-order counter.
  - **A3**: Increased order card text sizes (body text ≥ 15px, ID and total 19px, padding 18px), buttons min-height 48px, packing checkboxes 22px tap area. Responsive layout: side-by-side desktop grid (min ~360px per card), single column on mobile.
  - **A4**: Restructured Live Orders into two distinct sections: `💵 Cash on Delivery` and `⚡ Online Payments (Paid)`, each with a sticky header showing count and ₹ total. Active orders oldest-first; delivered/cancelled collapsed under `Completed`. Replaced Paid/Unpaid dropdown with Method filter (`All` / `COD` / `Online`). Distinct status badges: COD → `Collect ₹X on delivery` (amber), Online → `PAID ✅` (green).
  - **A5**: Enforced strict status order (`placed → accepted → packed → out_for_delivery → delivered`); no skipping or backwards steps. Blocked unpaid dispatch: Accept, Packed, and Out for delivery buttons disabled unless `paymentStatus === 'paid'`. Added COD delivery confirmation dialog prompt ("Cash collected ₹X?") that sets `paymentStatus: 'cod_collected'` and `codCollectedAt`. Tailored cancel confirmation text by payment type with required reason and unified request payload shape (`{ orderId, pushKey, reason }`). Corrected bill slip payment printing to reflect true payment state (`ONLINE – PAID`, `ONLINE – NOT PAID`, `COD – COLLECT ₹X`). Filtered reports and customer totals to count only COD or paid online orders (subtracting refunds) and displayed separate pending COD cash metric. Added audit logging to `/audit`.
  - **B2**: Rebranded portal headers, bill slips, WhatsApp templates, page titles, and exported CSV filenames from "RA Store" to "RA Store".
  - **C**: Fixed new-order chime: only chimes when order age < 2 minutes and added Web Audio synthesized fallback ding. Fixed delivery fee settings bug using `parseFloat` and `??` so ₹0 free delivery is preserved. Added category order up/down buttons (`▲` / `▼`) in Categories tab and blocked category deletion when products are still assigned to it. Added MRP field (`prodMrp`), inline error display (`#productFormError`), and form validation (name required, price > 0, MRP ≥ price). Limited live order listener to `limitToLast(200)` for performance.

- `index.html`:
  - **B1**: Grouped catalog into category sections in admin-defined order (`<section id="cat-{id}">`) with sticky headers showing icon, English/Telugu name, and item count. Added smooth scrolling and ~1.2s soft-green double-pulse blink (`@keyframes sectionBlink` with static outline fallback for `prefers-reduced-motion`). Implemented scroll-spy tracking active section and auto-scrolling chip bar horizontally. Search query triggers flat list of matches and disables scroll-spy; clearing restores sections. URL `?cat=<id>` scrolls to section on load without filtering. Optimized cart interactions: cart quantity adjustments update only the tapped card's controls (`updateProductCardControls`) and cart bar without re-rendering the catalog. Replaced per-render `IntersectionObserver` with a single shared lazy image observer.
  - **B2**: Fully rebranded customer-facing store to "RA Store" / "RA స్టోర్" (keeping the "Anantapur" badge). Replaced titles, meta tags, JSON-LD, navbar brand title, footer texts, WhatsApp pre-filled strings, Razorpay popup name, success modal, and login modal text. Responsive navbar wraps/shrinks brand gracefully on 360px mobile view without pushing cart or language toggle off-screen.
  - **B3**: Prevented double submit by disabling Place Order button until success, failure, or modal dismissal. Added Razorpay `modal.ondismiss` handler displaying "Payment not completed — your order is held for 15 minutes" notice with Pay now and Cancel buttons while keeping cart intact. Created checkout session `requestId` once per session for idempotency. Added server price check warning if server total differs from client total. Added network drop fallback: listens to RTDB `paymentStatus` for up to 60s before timing out with store helpline. My Orders displays payment method badges, full delivery address and notes, and for pending online orders displays 15m countdown, "Pay now ⚡" and "Cancel" buttons. Form validation requires name ≥ 2 chars, phone regex `^[6-9]\d{9}$`, address ≥ 10 chars, showing in-page notices (EN + TE) instead of alerts.
  - **C**: Updated cart drawer and checkout fee calculations to use `??` instead of `||` so `deliveryFee: 0` functions properly.

- `manifest.json`:
  - **B2**: Updated `name` to "RA Store — Anantapur", `short_name` to "RA Store", and icon SVG letter text from `RA` to `SS`.

- `sw.js`:
  - **B2**: Updated cache name to `sri-sai-store-shell-v3` and updated branding comments.

- `privacy-policy.html`:
  - **B2**: Replaced all mentions of "RA Store" with "RA Store".

- `refund-policy.html`:
  - **B2**: Replaced all mentions of "RA Store" with "RA Store".

- `terms.html`:
  - **B2**: Replaced all mentions of "RA Store" with "RA Store".

- `public/404.html`:
  - **B2**: Updated page title to "RA Store (శ్రీ సాయి జనరల్ ఆన్లైన్ స్టోర్)".

- `database.rules.json`:
  - **C**: Added `.indexOn: ["uid", "createdAt", "paymentStatus"]` under `orders` node. Hardened `searchMisses` write rule to allow unauthenticated customer writes only when string length is ≤ 60 characters to prevent spam.

- `worker/wrangler.toml`:
  - **D**: Cloudflare Worker configuration file defining service name `ra-store-api`, entry point `src/index.js`, compatibility date, and 5-minute cron trigger (`*/5 * * * *`).

- `worker/package.json`:
  - **D**: Minimal npm package configuration for Wrangler CLI deployment.

- `worker/src/index.js`:
  - **D**: Full self-contained Cloudflare Worker ES module:
    - Restricted CORS (allowing only `https://nikhil6281.github.io` and dev localhost).
    - Strict JSON error responses with `{ error, code }`.
    - `POST /api/create-order`: Firebase ID token authentication, server price recalculation from DB products and settings, minOrderValue enforcement, human order ID format (`YYMMDD-XXXX`), Razorpay order creation for online orders, and `requestId` idempotency.
    - `POST /api/verify-payment`: Constant-time HMAC-SHA256 signature verification, checks Razorpay API for `captured` status and exact paise amount, updates `paymentStatus: paid` idempotently.
    - `POST /api/razorpay-webhook`: Verifies `X-Razorpay-Signature`, handles `payment.captured`, `payment.failed`, `refund.processed`, and `refund.failed`.
    - `POST /api/cancel-order`: Verifies ownership, prevents cancel after `out_for_delivery`, triggers automated 100% refund for paid online orders via Razorpay Refund API, cancels COD/unpaid without refund.
    - `POST /api/admin/update-order`: Verifies admin, enforces order status transitions, blocks unpaid online dispatch.
    - `POST /api/admin/reconcile-order`: Verifies admin, reconciles payment state against Razorpay API.
    - Scheduled 5-minute cron: identifies unpaid online orders past 15-minute `expiresAt`, queries Razorpay, and cancels uncaptured orders as `expired`.

- `worker/README.md`:
  - **D**: Documentation listing all required Wrangler secrets, deploy commands, and verified vs. assumed requirements matrix.
