# SiteClok — Setup Guide

GPS-verified employee time tracking with Stripe subscriptions at $49.99/month.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Stripe

**a) Create a Stripe account** at https://stripe.com if you don't have one.

**b) Create your products** in the Stripe Dashboard:
- Go to **Products → Add Product**
- Name: "SiteClok Monthly" → Price: $49.99, recurring monthly
- Name: "SiteClok Annual"  → Price: $479.88, recurring yearly
- Copy both **Price IDs** (start with `price_...`)

**c) Get your API keys** from **Developers → API Keys**:
- Publishable key: starts with `pk_test_...`
- Secret key: starts with `sk_test_...`

### 3. Configure environment variables

Copy `.env.local` and fill in your keys:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_MONTHLY_PRICE_ID=price_YOUR_MONTHLY_PRICE_ID
STRIPE_ANNUAL_PRICE_ID=price_YOUR_ANNUAL_PRICE_ID
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# App
JWT_SECRET=any_long_random_string_at_least_32_chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set up the Stripe webhook (local development)

Install the Stripe CLI: https://stripe.com/docs/stripe-cli

```bash
# Login
stripe login

# Forward events to your local server
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the **webhook signing secret** it prints (starts with `whsec_...`) into `.env.local`.

### 5. Run the app

```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
siteclok/
├── components/
│   └── SiteClok.jsx          # Main app UI (subscription → location → clock)
├── lib/
│   └── stripe.js            # Stripe singleton + JWT session helpers
├── pages/
│   ├── _app.js
│   ├── index.js             # Entry point — checks session, renders SiteClok
│   └── api/
│       ├── create-checkout-session.js  # Creates Stripe Checkout session
│       ├── checkout-success.js         # Handles post-payment redirect, sets cookie
│       ├── webhook.js                  # Stripe webhook event handler
│       ├── session.js                  # Checks if user has active subscription
│       └── cancel-subscription.js     # Cancels Stripe subscription
├── .env.local               # Your secret keys (never commit this)
├── next.config.js
└── package.json
```

---

## How the Payment Flow Works

```
User clicks Subscribe
        ↓
POST /api/create-checkout-session
        ↓
Redirect to Stripe-hosted Checkout (stripe.com)
        ↓
User pays
        ↓
Stripe redirects to /api/checkout-success?session_id=...
        ↓
Server verifies payment with Stripe API
        ↓
Signs a JWT cookie (30 days) with subscription info
        ↓
Redirects to /?subscribed=true
        ↓
/api/session verifies cookie on every page load
        ↓
App skips paywall → goes straight to location gate
```

---

## Deploying to Production

### Vercel (recommended — free tier works)

```bash
npm install -g vercel
vercel
```

Then in the Vercel dashboard:
1. Add all your `.env.local` variables under **Settings → Environment Variables**
2. Change `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://siteclok.vercel.app`)

### Set up production webhook

In **Stripe Dashboard → Developers → Webhooks → Add endpoint**:
- URL: `https://yourdomain.com/api/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

Copy the signing secret into your Vercel environment variables.

### Switch to live keys

When ready to accept real payments:
1. In Stripe Dashboard, toggle from **Test** to **Live** mode
2. Replace your `sk_test_...` and `pk_test_...` keys with `sk_live_...` and `pk_live_...`
3. Recreate your products in live mode and update the Price IDs

---

## Test Cards (Stripe test mode)

| Card number          | Result             |
|---------------------|--------------------|
| 4242 4242 4242 4242 | Payment succeeds   |
| 4000 0000 0000 9995 | Payment declined   |
| 4000 0025 0000 3155 | Requires 3D Secure |

Use any future expiry date and any 3-digit CVC.

---

## Adding a Database (optional but recommended)

The current setup uses JWT cookies for auth — no database required. For production
with many users, add a database to:
- Track subscription status server-side (so cancellations take effect immediately)
- Store clock-in/out records persistently
- Support multiple employees per workspace

Recommended: **PlanetScale** (MySQL) or **Supabase** (Postgres), both have free tiers
and work great with Next.js + Vercel.
