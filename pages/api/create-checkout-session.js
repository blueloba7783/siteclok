// pages/api/create-checkout-session.js
import { getStripe } from "../../lib/stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { billingCycle } = req.body;

  if (!["monthly", "annual"].includes(billingCycle)) {
    return res.status(400).json({ error: "Invalid billing cycle" });
  }

  const priceId =
    billingCycle === "annual"
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // After payment, Stripe redirects here with ?session_id=...
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?cancelled=true`,
      subscription_data: {
        metadata: {
          billingCycle,
        },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
