// lib/stripe.js
// Stripe singleton (server-side only)
import Stripe from "stripe";

let stripeInstance;
export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10",
    });
  }
  return stripeInstance;
}

// ─── JWT session helpers ──────────────────────────────────────────────────────
// We use a signed cookie so users can't fake a subscription.
// Import these only in API routes (Node runtime).

import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";

const COOKIE_NAME = "siteclok_session";
const JWT_SECRET = process.env.JWT_SECRET;

export function createSessionCookie(payload) {
  // payload: { email, customerId, subscriptionId, billingCycle }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function getSession(req) {
  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies[COOKIE_NAME];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function clearSessionCookie() {
  return serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
