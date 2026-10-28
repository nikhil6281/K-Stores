# RA Store — Cloudflare Worker API

Cloudflare Worker backend for **RA Store** (Anantapur, AP).
Handles server-side price recalculation, order creation, Razorpay order/payment verification, Razorpay webhooks, 100% automated refunds, admin reconciliation, and 15-minute unpaid order expiry.

## Worker URL
`https://ra-store-api.chowdarynikhil095.workers.dev`

---

## 1. Secrets Configuration

Run the following commands in the `worker/` directory using Cloudflare Wrangler CLI:

```bash
# 1. Razorpay Key ID (Live / Test)
npx wrangler secret put RAZORPAY_KEY_ID

# 2. Razorpay Key Secret
npx wrangler secret put RAZORPAY_KEY_SECRET

# 3. Razorpay Webhook Secret (from Razorpay Dashboard -> Settings -> Webhooks)
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET

# 4. Firebase Project ID (k-store-ae9dd)
npx wrangler secret put FIREBASE_PROJECT_ID

# 5. Firebase Service Account Client Email
npx wrangler secret put FIREBASE_CLIENT_EMAIL

# 6. Firebase Service Account Private Key (PEM format including BEGIN/END lines)
npx wrangler secret put FIREBASE_PRIVATE_KEY

# 7. Firebase Realtime Database URL (https://k-store-ae9dd-default-rtdb.firebaseio.com)
npx wrangler secret put FIREBASE_DATABASE_URL
```

---

## 2. Deployment

```bash
cd worker
npm install
npx wrangler deploy
```

---

## 3. Endpoints

- `GET /`: Health check (`{ status: "ok", store: "RA Store", city: "Anantapur" }`)
- `POST /api/create-order`: Server price check, PIN check (Anantapur), human ID format, Razorpay order creation
- `POST /api/verify-payment`: Constant-time HMAC-SHA256 signature verification & Razorpay capture confirmation
- `POST /api/razorpay-callback`: Dedicated redirect-mode callback for in-app browsers
- `POST /api/razorpay-webhook`: Webhook handling with `X-Razorpay-Signature` validation
- `POST /api/cancel-order`: 100% automated refund before dispatch
- `POST /api/admin/update-order`: Strict status state machine
- `POST /api/admin/reconcile-order`: Admin payment reconciliation
- `cron (every 5 min)`: Unpaid online order expiry after 15 min
