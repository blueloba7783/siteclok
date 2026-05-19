// pages/api/checkout-success.js
// Stripe redirects here after successful payment.
// We verify the session, create a signed cookie, then redirect to the app.

import { getStripe, createSessionCookie } from "../../lib/stripe";

export default async function handler(req, res) {
  const { session_id } = req.query;

  if (!session_id) {
    return res.redirect("/?error=missing_session");
  }

  try {
    const stripe = getStripe();

    // Retrieve the completed Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return res.redirect("/?error=payment_incomplete");
    }

    const billingCycle =
      session.subscription?.metadata?.billingCycle || "monthly";

    // Issue a signed session cookie so the front-end knows they're subscribed
    const cookie = createSessionCookie({
      email: session.customer_details?.email,
      customerId: session.customer,
      subscriptionId: session.subscription?.id,
      billingCycle,
    });

    res.setHeader("Set-Cookie", cookie);

    // Redirect into the app — the front-end reads the session to skip the paywall
    return res.redirect("/?subscribed=true");
  } catch (err) {
    console.error("Checkout success error:", err.message);
    return res.redirect("/?error=verification_failed");
  }
}
