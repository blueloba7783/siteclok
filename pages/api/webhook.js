// pages/api/webhook.js
// Stripe sends POST events here for the full subscription lifecycle.
// IMPORTANT: This route needs the raw body — disable Next.js body parsing.

import { getStripe, clearSessionCookie } from "../../lib/stripe";

export const config = {
  api: {
    bodyParser: false, // Must be raw for Stripe signature verification
  },
};

// Read the raw body as a Buffer
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // ── Handle events ──────────────────────────────────────────────────────────
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("✅ New subscription:", {
        customer: session.customer,
        email: session.customer_details?.email,
        subscription: session.subscription,
      });
      // TODO: Save to your database here
      // e.g. await db.subscriptions.upsert({ customerId: session.customer, email: ..., status: 'active' })
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      console.log("🔄 Subscription updated:", {
        id: subscription.id,
        status: subscription.status,
      });
      // TODO: Update subscription status in your DB
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      console.log("❌ Subscription cancelled:", subscription.id);
      // TODO: Mark user as unsubscribed in your DB
      // Their cookie will still work until it expires (30 days), or you can
      // invalidate by storing a 'cancelled' flag and checking it on /api/session
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.log("💳 Payment failed for customer:", invoice.customer);
      // TODO: Email the customer about the failed payment
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      console.log("💰 Invoice paid:", invoice.id);
      // TODO: Extend the user's access period in your DB
      break;
    }

    default:
      // Ignore unhandled event types
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
