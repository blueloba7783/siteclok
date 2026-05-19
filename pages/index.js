// pages/index.js
import { useEffect, useState } from "react";
import SiteClok from "../components/SiteClok";

export default function Home() {
  const [sessionState, setSessionState] = useState("loading"); // loading | subscribed | unsubscribed

  useEffect(() => {
    // Check for URL params from Stripe redirect or cancellation
    const params = new URLSearchParams(window.location.search);
    const subscribed = params.get("subscribed");
    const cancelled = params.get("cancelled");
    const error = params.get("error");

    if (error) {
      console.error("Checkout error:", error);
    }

    // Clean the URL regardless
    if (subscribed || cancelled || error) {
      window.history.replaceState({}, "", "/");
    }

    // Always verify session server-side (cookie-based)
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => {
        setSessionState(data.subscribed ? "subscribed" : "unsubscribed");
      })
      .catch(() => setSessionState("unsubscribed"));
  }, []);

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch("/api/cancel-subscription", { method: "POST" });
      const data = await res.json();
      if (data.cancelled) {
        setSessionState("unsubscribed");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  if (sessionState === "loading") {
    return (
      <div style={{
        minHeight: "100dvh", background: "#080c14",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid #6366f1", borderTopColor: "transparent",
          animation: "spin 0.9s linear infinite",
        }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #080c14; }
        `}</style>
      </div>
    );
  }

  return (
    <SiteClok
      initialSubscribed={sessionState === "subscribed"}
      onCancelSubscription={handleCancelSubscription}
    />
  );
}
