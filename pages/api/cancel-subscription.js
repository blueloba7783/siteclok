// pages/api/cancel-subscription.js
import { getStripe, getSession, clearSessionCookie } from "../../lib/stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = getSession(req);
  if (!session?.subscriptionId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const stripe = getStripe();

    // Cancel at period end — user keeps access until billing cycle ends
    await stripe.subscriptions.update(session.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Clear the session cookie
    res.setHeader("Set-Cookie", clearSessionCookie());

    return res.status(200).json({ cancelled: true });
  } catch (err) {
    console.error("Cancel error:", err.message);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}
