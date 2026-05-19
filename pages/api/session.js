// pages/api/session.js
// Called by the front-end on every load to check if the user has an active subscription.
// Returns { subscribed: true, email, billingCycle } or { subscribed: false }

import { getSession } from "../../lib/stripe";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = getSession(req);

  if (!session) {
    return res.status(200).json({ subscribed: false });
  }

  return res.status(200).json({
    subscribed: true,
    email: session.email,
    customerId: session.customerId,
    subscriptionId: session.subscriptionId,
    billingCycle: session.billingCycle,
  });
}
