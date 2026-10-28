# Sri Sai General Online Store — Cloudflare Worker API

Cloudflare Worker backend for **Sri Sai General Online Store** (Bommalatapalli, AP).
Handles server-side price recalculation, order creation, Razorpay order/payment verification, Razorpay webhooks, 100% automated refunds, admin reconciliation, and 15-minute unpaid order expiry.

## Worker URL
`https://ra-store-api.chowdarynikhil095.workers.dev`

---

## 1. Secrets to Set

Run the following commands in the `worker/` directory using the Cloudflare Wrangler CLI:

```bash
# 1. Razorpay Key ID (Live / Test)
wrangler secret put RAZORPAY_KEY_ID

# 2. Razorpay Key Secret
wrangler secret put RAZORPAY_KEY_SECRET

# 3. Razorpay Webhook Secret (from Razorpay Dashboard -> Settings -> Webhooks)
wrangler secret put RAZORPAY_WEBHOOK_SECRET

# 4. Firebase Project ID (e.g. k-stores-4299b)
wrangler secret put FIREBASE_PROJECT_ID

# 5. Firebase Service Account Client Email
wrangler secret put FIREBASE_CLIENT_EMAIL

# 6. Firebase Service Account Private Key (PEM format including BEGIN/END lines)
wrangler secret put FIREBASE_PRIVATE_KEY

# 7. Firebase Realtime Database URL (e.g. https://k-stores-4299b-default-rtdb.firebaseio.com)
wrangler secret put FIREBASE_DATABASE_URL
```

---

## 2. Deployment

```bash
cd worker
npm install
wrangler deploy
```

---

## 3. Worker Requirements Status: Verified vs Assumed

| Requirement | Contract Behavior | Status | Details |
| :--- | :--- | :--- | :--- |
| **CORS Restriction** | Only allows `https://nikhil6281.github.io` (and `localhost` in dev) | **Verified** | Strict preflight and response headers; rejects unauthorized foreign origins |
| **Error Shape** | Strict JSON format: `{ error: string, code: string }` | **Verified** | Standardized `jsonError()` helper used across all handlers |
| **Authentication** | Firebase ID Token (`Authorization: Bearer <token>`) | **Verified** | Decodes and validates JWT claims (`iss`, `aud`, `exp`) against Google Firebase project |
| **Price Recalculation** | Recalculate total on server from DB; reject client prices | **Verified** | Server loads `/products` and `/settings` via REST API, ignoring client totals |
| **Min Order Value** | Enforce `settings.minOrderValue` | **Verified** | Rejects orders with `MIN_ORDER_NOT_MET` if subtotal is below minimum |
| **Order ID Format** | Human readable `YYMMDD-XXXX` (e.g. `260418-0421`) | **Verified** | Formatted from current UTC/IST date + 4 random digits |
| **Idempotency** | Prevent duplicate orders using `requestId` + `uid` | **Verified** | If same `requestId` is re-sent, returns existing order rather than creating a duplicate |
| **Payment Verification** | Constant-time HMAC-SHA256 signature check | **Verified** | Bitwise XOR constant-time comparison prevents timing attacks |
| **Payment Verification** | Check Razorpay payment status `captured` & amount | **Verified** | Calls Razorpay Payments API to confirm capture and exact paise amount |
| **Razorpay Webhook** | Validates `X-Razorpay-Signature` with `WEBHOOK_SECRET` | **Verified** | Supports `payment.captured`, `payment.failed`, `refund.processed`, `refund.failed` |
| **Automated Refunds** | 100% refund via Razorpay Refund API on cancellation | **Verified** | Issues full refund using `payments/{payment_id}/refund` before `out_for_delivery` |
| **Cancellation Rules** | Allowed only before `out_for_delivery` | **Verified** | Rejects cancellations if status is `out_for_delivery` or `delivered` |
| **Scheduled Expiry** | 5-minute cron checking uncaptured orders past `expiresAt` | **Verified** | Marks expired orders as `status: cancelled, paymentStatus: expired` |
| **Admin Authorization** | Checks `/admins/{uid}` in RTDB | **Verified** | Protects status advancement and reconciliation |
| **Firebase RTDB Access** | Authenticated via Google Service Account OAuth2 | **Assumed** | Assumes service account credentials (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) are generated from Firebase Console |
