// components/SiteClok.jsx
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Utility ────────────────────────────────────────────────────────────────

function formatDuration(ms) {
  if (!ms) return "0h 0m";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}
function formatTime(d) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function formatDate(d) { return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }); }
function formatShortTime(d) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function minutesEarly(ts, endH, endM) {
  const co = new Date(ts), eod = new Date(ts);
  eod.setHours(endH, endM, 0, 0);
  return Math.round((eod - co) / 60000);
}

// ─── Subscription Screen ─────────────────────────────────────────────────────

function SubscriptionScreen({ onSubscribed }) {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const annualMonthly = (49.99 * 0.8).toFixed(2);
  const annualTotal = (49.99 * 12 * 0.8).toFixed(2);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingCycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        setError("Could not start checkout. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const features = [
    { icon: "📍", text: "GPS-verified clock in & out" },
    { icon: "⚠️", text: "Early departure detection" },
    { icon: "🗺️", text: "Full location history per punch" },
    { icon: "📋", text: "Session log with coordinates" },
    { icon: "⏱️", text: "Live shift timer & overtime alerts" },
    { icon: "⚙️", text: "Configurable shift end times" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#080c14", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 0 48px", fontFamily: "'Syne', sans-serif" }}>
      {/* Hero */}
      <div style={{ width: "100%", maxWidth: 420, background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "36px 28px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15), transparent)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: 4 }}>
            SITE<span style={{ color: "#818cf8" }}>CLOK</span>
          </div>
          <div style={{ fontSize: 11, color: "#6366f1", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", marginBottom: 20 }}>JOB SITE TIME TRACKING</div>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 30, padding: 3, marginBottom: 18 }}>
            {["monthly", "annual"].map((c) => (
              <button key={c} onClick={() => setBillingCycle(c)} style={{ padding: "6px 16px", borderRadius: 24, border: "none", background: billingCycle === c ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", color: billingCycle === c ? "#fff" : "#6b7280", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.06em" }}>
                {c === "monthly" ? "MONTHLY" : "ANNUAL"}
                {c === "annual" && <span style={{ marginLeft: 4, fontSize: 9, color: billingCycle === "annual" ? "#bbf7d0" : "#22c55e" }}>-20%</span>}
              </button>
            ))}
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.03em", lineHeight: 1 }}>
              ${billingCycle === "annual" ? annualMonthly : "49.99"}
            </span>
            <span style={{ fontSize: 13, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>/mo</span>
          </div>
          {billingCycle === "annual"
            ? <div style={{ fontSize: 11, color: "#4ade80", fontFamily: "'DM Mono', monospace" }}>Billed ${annualTotal}/year · saves ${(49.99 * 12 * 0.2).toFixed(2)}/yr</div>
            : <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>Billed $49.99 every month · cancel anytime</div>
          }
        </div>
      </div>

      {/* Body */}
      <div style={{ width: "100%", maxWidth: 420, padding: "24px 24px 0" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Everything you need to track your team</div>
        <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>Per workspace · unlimited employees</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {features.map((f) => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
              <span style={{ fontSize: 13, color: "#cbd5e1", fontFamily: "'DM Mono', monospace" }}>{f.text}</span>
              <span style={{ marginLeft: "auto", color: "#22c55e", fontSize: 14 }}>✓</span>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", marginBottom: 24 }}>
          <span style={{ fontSize: 22 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 12, color: "#4ade80", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>30-DAY MONEY-BACK GUARANTEE</div>
            <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginTop: 1 }}>Not satisfied? Full refund, no questions asked.</div>
          </div>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 14, fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#f87171" }}>
            ⚠ {error}
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{ width: "100%", padding: "16px", background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", border: "none", borderRadius: 14, color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.01em", boxShadow: loading ? "none" : "0 8px 32px rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          {loading ? (
            <><div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} /> Redirecting to Stripe…</>
          ) : (
            <>🔒 Subscribe · ${billingCycle === "monthly" ? "49.99" : annualMonthly}/mo</>
          )}
        </button>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace" }}>
          Secured by Stripe · 256-bit SSL · Cancel anytime
        </div>

        {/* Stripe badge */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 16, opacity: 0.4 }}>
          <svg width="40" height="16" viewBox="0 0 60 25" fill="none">
            <path d="M27.5 8.3c0-1 .8-1.4 2.2-1.4 2 0 4.4.6 6.4 1.7V3.1C33.8 1.7 31.5 1 29 1c-5 0-8.4 2.7-8.4 7.1 0 7 9.6 5.8 9.6 8.8 0 1.2-1 1.6-2.5 1.6-2.2 0-5-.9-7.2-2.2v5.6c2.4 1 4.9 1.5 7.2 1.5 5.2 0 8.7-2.6 8.7-7.1-.1-7.5-9.9-6.1-9.9-8z" fill="white"/>
            <path d="M0 7.4l.3-1.5H5V22H0V7.4zM2.5 0C.9 0 0 .9 0 2.4S.9 4.8 2.5 4.8 5 3.9 5 2.4 4.1 0 2.5 0z" fill="white"/>
          </svg>
          <span style={{ fontSize: 10, color: "#fff", fontFamily: "'DM Mono', monospace" }}>Payments by Stripe</span>
        </div>
      </div>
    </div>
  );
}

// ─── Location Gate ────────────────────────────────────────────────────────────

function LocationGate({ onGranted, requesting }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#080c14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2), rgba(30,41,59,0.8))", border: "2px solid rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: "0 0 60px rgba(99,102,241,0.2)", animation: requesting ? "locPulse 1.2s ease-in-out infinite" : "none" }}>📍</div>
        {requesting && <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.4)", animation: "pulseRing 1.5s ease-out infinite" }} />}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif", marginBottom: 10 }}>Location Required</div>
      <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "'DM Mono', monospace", lineHeight: 1.7, maxWidth: 300, marginBottom: 28 }}>SiteClok requires GPS to verify job site presence on every clock-in and clock-out.</div>
      {requesting ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#6b7280" }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />Acquiring GPS…
        </div>
      ) : (
        <button onClick={onGranted} style={{ width: "100%", maxWidth: 320, padding: "16px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 14, color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" }}>
          Enable Location Access
        </button>
      )}
    </div>
  );
}

function LocationDenied({ onRetry }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#080c14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div style={{ width: 96, height: 96, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 28 }}>🚫</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif", marginBottom: 10 }}>Location Denied</div>
      <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "'DM Mono', monospace", lineHeight: 1.7, maxWidth: 300, marginBottom: 28 }}>Enable location in your browser settings, then tap Retry.</div>
      <button onClick={onRetry} style={{ width: "100%", maxWidth: 320, padding: "14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0", fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Retry Location</button>
    </div>
  );
}

// ─── Swipe Button ────────────────────────────────────────────────────────────

function SwipeButton({ isClockedIn, onSwipe, disabled }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const startXRef = useRef(null);
  const THRESHOLD = 0.78;
  const thumbSize = 64;

  const getTrackWidth = () => trackRef.current?.getBoundingClientRect().width || 300;
  const reset = useCallback(() => { setProgress(0); setDragging(false); startXRef.current = null; }, []);
  const handleStart = (x) => { if (disabled || confirmed) return; setDragging(true); startXRef.current = x; };
  const handleMove = useCallback((x) => {
    if (!dragging || startXRef.current === null) return;
    setProgress(Math.max(0, Math.min(x - startXRef.current, getTrackWidth() - thumbSize - 8)) / (getTrackWidth() - thumbSize - 8));
  }, [dragging]);
  const handleEnd = useCallback(() => {
    if (!dragging) return;
    if (progress >= THRESHOLD) { setConfirmed(true); setTimeout(() => { onSwipe(); setConfirmed(false); reset(); }, 400); }
    else reset();
    setDragging(false);
  }, [dragging, progress, onSwipe, reset]);

  useEffect(() => {
    if (!dragging) return;
    const mm = (e) => handleMove(e.clientX), mu = () => handleEnd();
    window.addEventListener("mousemove", mm); window.addEventListener("mouseup", mu);
    return () => { window.removeEventListener("mousemove", mm); window.removeEventListener("mouseup", mu); };
  }, [dragging, handleMove, handleEnd]);

  useEffect(() => {
    if (!dragging) return;
    const tm = (e) => handleMove(e.touches[0].clientX), tu = () => handleEnd();
    window.addEventListener("touchmove", tm, { passive: true }); window.addEventListener("touchend", tu);
    return () => { window.removeEventListener("touchmove", tm); window.removeEventListener("touchend", tu); };
  }, [dragging, handleMove, handleEnd]);

  const fc = disabled ? "#4b5563" : isClockedIn ? "#ef4444" : "#22c55e";
  const tx = progress * (getTrackWidth() - thumbSize - 8);
  const label = disabled ? "Acquiring location…" : isClockedIn ? (confirmed ? "Clocked Out" : "Swipe to Clock Out →") : (confirmed ? "Clocked In!" : "Swipe to Clock In →");

  return (
    <div ref={trackRef} onMouseDown={(e) => handleStart(e.clientX)} onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      style={{ position: "relative", height: 72, borderRadius: 36, background: `linear-gradient(90deg, ${fc}2e 0%, ${fc}08 100%)`, border: `1.5px solid ${fc}33`, cursor: disabled ? "not-allowed" : "grab", userSelect: "none", overflow: "hidden", opacity: disabled ? 0.6 : 1 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${4 + progress * 96}%`, background: `${fc}22`, borderRadius: 36, transition: dragging ? "none" : "width 0.3s ease", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: "0.08em", color: `${fc}bb`, fontWeight: 500, pointerEvents: "none", opacity: confirmed ? 1 : 1 - progress * 0.4 }}>{label}</div>
      <div style={{ position: "absolute", top: 4, left: 4 + tx, width: thumbSize, height: thumbSize, borderRadius: "50%", background: confirmed ? fc : `linear-gradient(135deg, ${fc}ee, ${fc}88)`, boxShadow: `0 4px 20px ${fc}55`, display: "flex", alignItems: "center", justifyContent: "center", transition: dragging ? "none" : "left 0.3s cubic-bezier(0.34,1.56,0.64,1)", cursor: dragging ? "grabbing" : "grab", fontSize: 22 }}>
        {disabled ? "…" : confirmed ? "✓" : isClockedIn ? "⏹" : "▶"}
      </div>
    </div>
  );
}

// ─── Location Card ────────────────────────────────────────────────────────────

function LocationCard({ location, label, timestamp, accent = "#6366f1" }) {
  if (!location) return null;
  return (
    <div onClick={() => window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, "_blank")}
      style={{ borderRadius: 12, border: `1px solid ${accent}22`, background: `${accent}0a`, padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}
      onMouseEnter={(e) => e.currentTarget.style.background = `${accent}18`}
      onMouseLeave={(e) => e.currentTarget.style.background = `${accent}0a`}
    >
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${accent}18`, border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📍</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", color: accent, fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "'DM Mono', monospace" }}>{formatShortTime(new Date(timestamp))}</span>
        </div>
        <div style={{ fontSize: 13, color: "#e2e8f0", fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{location.city || "Unknown"}</div>
        <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>{location.lat.toFixed(5)}, {location.lng.toFixed(5)} <span style={{ color: accent + "88" }}>↗ map</span></div>
      </div>
    </div>
  );
}

function EarlyBadge({ minsEarly, inline = false }) {
  if (minsEarly <= 0) return null;
  const h = Math.floor(minsEarly / 60), m = minsEarly % 60;
  const label = h > 0 ? `${h}h ${m}m early` : `${m}m early`;
  if (inline) return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontFamily: "'DM Mono', monospace", background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)", whiteSpace: "nowrap" }}>⚠ {label}</span>;
  return <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", marginTop: 10 }}><div style={{ fontSize: 20 }}>⚠️</div><div><div style={{ fontSize: 12, color: "#fb923c", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>EARLY DEPARTURE</div><div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Mono', monospace", marginTop: 1 }}>Left {label} before end of day</div></div></div>;
}

// ─── Settings Modal ───────────────────────────────────────────────────────────

function SettingsModal({ endHour, endMinute, onSave, onClose, onCancelSubscription }) {
  const [h, setH] = useState(String(endHour).padStart(2, "0"));
  const [m, setM] = useState(String(endMinute).padStart(2, "0"));
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    await onCancelSubscription();
    setCancelling(false);
  };

  const presets = [
    { label: "4:00 PM", h: 16, m: 0 }, { label: "4:30 PM", h: 16, m: 30 },
    { label: "5:00 PM", h: 17, m: 0 }, { label: "5:30 PM", h: 17, m: 30 },
    { label: "6:00 PM", h: 18, m: 0 },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px 20px 0 0", padding: "24px 24px 36px", animation: "slideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne', sans-serif" }}>Shift Settings</div>
            <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>End-of-day time & subscription</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#9ca3af", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>

        {/* Subscription badge */}
        <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#4ade80", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>SUBSCRIPTION ACTIVE</div>
            <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>SiteClok · $49.99/month</div>
          </div>
          {!showCancel ? (
            <button onClick={() => setShowCancel(true)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "5px 10px", color: "#ef4444", fontFamily: "'DM Mono', monospace", fontSize: 10, cursor: "pointer" }}>Cancel</button>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleCancel} disabled={cancelling} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "5px 10px", color: "#ef4444", fontFamily: "'DM Mono', monospace", fontSize: 10, cursor: "pointer" }}>
                {cancelling ? "…" : "Confirm"}
              </button>
              <button onClick={() => setShowCancel(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 10px", color: "#9ca3af", fontFamily: "'DM Mono', monospace", fontSize: 10, cursor: "pointer" }}>Keep</button>
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 12 }}>END OF DAY TIME</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {presets.map((p) => (
            <button key={p.label} onClick={() => { setH(String(p.h).padStart(2,"0")); setM(String(p.m).padStart(2,"0")); }} style={{ padding: "6px 12px", borderRadius: 20, background: parseInt(h) === p.h && parseInt(m) === p.m ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)", border: `1px solid ${parseInt(h) === p.h && parseInt(m) === p.m ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)"}`, color: parseInt(h) === p.h && parseInt(m) === p.m ? "#a5b4fc" : "#6b7280", fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: "pointer" }}>{p.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'DM Mono', monospace", marginBottom: 6, letterSpacing: "0.1em" }}>HOUR (0–23)</div>
            <input type="number" min="0" max="23" value={h} onChange={(e) => setH(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontFamily: "'DM Mono', monospace", fontSize: 18, textAlign: "center", outline: "none" }} />
          </div>
          <div style={{ color: "#4b5563", fontFamily: "'DM Mono', monospace", fontSize: 24, marginTop: 16 }}>:</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'DM Mono', monospace", marginBottom: 6, letterSpacing: "0.1em" }}>MINUTE</div>
            <input type="number" min="0" max="59" value={m} onChange={(e) => setM(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontFamily: "'DM Mono', monospace", fontSize: 18, textAlign: "center", outline: "none" }} />
          </div>
        </div>
        <button onClick={() => { onSave(Math.max(0,Math.min(23,parseInt(h)||0)), Math.max(0,Math.min(59,parseInt(m)||0))); onClose(); }} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Save Settings</button>
      </div>
    </div>
  );
}

// ─── Log Entry ────────────────────────────────────────────────────────────────

function LogEntry({ entry, index, endHour, endMinute }) {
  const [expanded, setExpanded] = useState(false);
  const duration = entry.clockOut ? entry.clockOut - entry.clockIn : Date.now() - entry.clockIn;
  const early = entry.clockOut ? minutesEarly(entry.clockOut, endHour, endMinute) : 0;
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", animation: "slideIn 0.3s ease", animationFillMode: "both", animationDelay: `${index * 0.04}s`, background: early > 0 ? "rgba(251,146,60,0.03)" : "transparent", borderLeft: early > 0 ? "2px solid rgba(251,146,60,0.4)" : "2px solid transparent" }}>
      <div onClick={() => setExpanded(e => !e)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 16px", cursor: "pointer" }}>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginBottom: 2 }}>{formatDate(new Date(entry.clockIn))}</div>
          <div style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "'DM Mono', monospace" }}>{formatShortTime(new Date(entry.clockIn))} → {entry.clockOut ? formatShortTime(new Date(entry.clockOut)) : <span style={{ color: "#22c55e" }}>Active</span>}</div>
          {early > 0 && <div style={{ marginTop: 4 }}><EarlyBadge minsEarly={early} inline /></div>}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
          {entry.inLocation ? <><span style={{ fontSize: 10 }}>📍</span> {entry.inLocation.city || `${entry.inLocation.lat.toFixed(4)},${entry.inLocation.lng.toFixed(4)}`}</> : <span style={{ color: "#ef4444", fontSize: 10 }}>⚠ None</span>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontFamily: "'DM Mono', monospace", background: entry.clockOut ? "rgba(99,102,241,0.15)" : "rgba(34,197,94,0.15)", color: entry.clockOut ? "#a5b4fc" : "#4ade80", border: `1px solid ${entry.clockOut ? "#6366f133" : "#22c55e33"}` }}>{formatDuration(duration)}</div>
          <div style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{expanded ? "▲" : "▼"} details</div>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          <LocationCard location={entry.inLocation} label="CLOCK IN" timestamp={entry.clockIn} accent="#22c55e" />
          {entry.clockOut ? <LocationCard location={entry.outLocation} label="CLOCK OUT" timestamp={entry.clockOut} accent={early > 0 ? "#fb923c" : "#6366f1"} /> : <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#4ade80" }}>● Session active</div>}
          {entry.inLocation && (
            <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4b5563", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><div style={{ color: "#374151", marginBottom: 2 }}>IN COORDS</div><div>{entry.inLocation.lat.toFixed(6)}</div><div>{entry.inLocation.lng.toFixed(6)}</div></div>
              {entry.outLocation && <div><div style={{ color: "#374151", marginBottom: 2 }}>OUT COORDS</div><div>{entry.outLocation.lat.toFixed(6)}</div><div>{entry.outLocation.lng.toFixed(6)}</div></div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main SiteClok Component ───────────────────────────────────────────────────

export default function SiteClok({ initialSubscribed = false, onCancelSubscription }) {
  const [screen, setScreen] = useState(initialSubscribed ? "gate" : "subscription");
  const [requestingLoc, setRequestingLoc] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeLocation, setActiveLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState("ready");
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("clock");
  const [totalToday, setTotalToday] = useState(0);
  const [liveElapsed, setLiveElapsed] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [endHour, setEndHour] = useState(17);
  const [endMinute, setEndMinute] = useState(0);
  const [lastEarlyMins, setLastEarlyMins] = useState(null);
  const [swipeDisabled, setSwipeDisabled] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(new Date());
      if (isClockedIn && clockInTime) setLiveElapsed(Date.now() - clockInTime);
    }, 1000);
    return () => clearInterval(id);
  }, [isClockedIn, clockInTime]);

  useEffect(() => {
    const today = new Date().toDateString();
    const done = entries.filter(e => new Date(e.clockIn).toDateString() === today && e.clockOut);
    setTotalToday(done.reduce((sum, e) => sum + (e.clockOut - e.clockIn), 0));
  }, [entries]);

  const getLocationMandatory = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(); return; }
      setGeoStatus("fetching"); setSwipeDisabled(true);
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude: lat, longitude: lng } }) => {
          let city = null;
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const d = await r.json();
            city = d.address?.city || d.address?.town || d.address?.village || d.address?.suburb || null;
          } catch {}
          setGeoStatus("ok"); setSwipeDisabled(false);
          resolve({ lat, lng, city, timestamp: Date.now() });
        },
        () => { setGeoStatus("ready"); setSwipeDisabled(false); reject(); },
        { timeout: 12000, maximumAge: 0, enableHighAccuracy: true }
      );
    });

  const handleRequestPermission = async () => {
    setRequestingLoc(true);
    try { await getLocationMandatory(); setScreen("app"); }
    catch { setScreen("denied"); }
    setRequestingLoc(false);
  };

  const handleSwipe = async () => {
    let loc;
    try { loc = await getLocationMandatory(); }
    catch { setScreen("denied"); return; }
    if (!isClockedIn) {
      const now = Date.now();
      setActiveLocation(loc); setClockInTime(now); setIsClockedIn(true); setLiveElapsed(0); setLastEarlyMins(null);
      setEntries(prev => [{ clockIn: now, clockOut: null, inLocation: loc, outLocation: null, earlyMins: 0, id: now }, ...prev]);
    } else {
      const now = Date.now(), early = minutesEarly(now, endHour, endMinute);
      setIsClockedIn(false); setLastEarlyMins(early > 0 ? early : null);
      setEntries(prev => prev.map((e, i) => i === 0 && !e.clockOut ? { ...e, clockOut: now, outLocation: loc, earlyMins: early > 0 ? early : 0 } : e));
      setClockInTime(null); setLiveElapsed(0); setActiveLocation(null);
    }
    setGeoStatus("ready");
  };

  const handleCancelSub = async () => {
    await onCancelSubscription();
    setScreen("subscription");
  };

  const todayEntries = entries.filter(e => new Date(e.clockIn).toDateString() === new Date().toDateString());
  const earlyTodayCount = todayEntries.filter(e => e.earlyMins > 0).length;
  const endTimeLabel = new Date(0,0,0,endHour,endMinute).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  const eodStatus = (() => {
    if (!isClockedIn) return null;
    const eod = new Date(); eod.setHours(endHour, endMinute, 0, 0);
    const ml = Math.round((eod - new Date()) / 60000);
    if (ml < 0) return { type: "overdue", minsLeft: ml };
    if (ml <= 30) return { type: "warning", minsLeft: ml };
    return { type: "ok", minsLeft: ml };
  })();

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080c14; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.6; } 70% { transform: scale(1.35); opacity: 0; } 100% { transform: scale(1.35); opacity: 0; } }
    @keyframes locPulse { 0%,100% { box-shadow: 0 0 40px rgba(99,102,241,0.2); } 50% { box-shadow: 0 0 70px rgba(99,102,241,0.45); } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes shakeIn { 0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)} }
    @keyframes spin { to { transform: rotate(360deg); } }
    .tab-btn { flex:1; padding:10px; background:none; border:none; cursor:pointer; font-family:'DM Mono',monospace; font-size:13px; letter-spacing:0.05em; transition:color 0.2s,background 0.2s; border-radius:8px; }
    .tab-btn.active { background:rgba(99,102,241,0.15); color:#a5b4fc; }
    .tab-btn:not(.active) { color:#4b5563; }
    ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
    input[type=number]::-webkit-inner-spin-button{opacity:1}
  `;

  if (screen === "subscription") return <><style>{styles}</style><SubscriptionScreen onSubscribed={() => setScreen("gate")} /></>;
  if (screen === "gate") return <><style>{styles}</style><LocationGate onGranted={handleRequestPermission} requesting={requestingLoc} /></>;
  if (screen === "denied") return <><style>{styles}</style><LocationDenied onRetry={() => setScreen("gate")} /></>;

  return (
    <>
      <style>{styles}</style>
      {showSettings && <SettingsModal endHour={endHour} endMinute={endMinute} onSave={(h,m) => { setEndHour(h); setEndMinute(m); }} onClose={() => setShowSettings(false)} onCancelSubscription={handleCancelSub} />}

      <div style={{ width: "100%", maxWidth: 420, minHeight: "100dvh", background: "#0d1117", display: "flex", flexDirection: "column", fontFamily: "'Syne', sans-serif", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 340, height: 340, borderRadius: "50%", pointerEvents: "none", background: isClockedIn ? "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)" : "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", transition: "background 1s ease" }} />

        <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>SITE<span style={{ color: "#6366f1" }}>CLOK</span></div>
            <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginTop: 1 }}>JOB SITE TIME TRACKING</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, color: "#e2e8f0", fontFamily: "'DM Mono', monospace" }}>{formatTime(currentTime)}</div>
              <div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>{formatDate(currentTime)}</div>
            </div>
            <button onClick={() => setShowSettings(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6b7280" }}>
              <span>⚙</span> EOD {endTimeLabel}
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 24px 0" }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.05)" }}>
            <button className={`tab-btn ${activeTab === "clock" ? "active" : ""}`} onClick={() => setActiveTab("clock")}>◉ Clock</button>
            <button className={`tab-btn ${activeTab === "log" ? "active" : ""}`} onClick={() => setActiveTab("log")}>
              ≡ Log{entries.length > 0 ? ` (${entries.length})` : ""}
              {earlyTodayCount > 0 && <span style={{ marginLeft: 6, background: "rgba(251,146,60,0.2)", color: "#fb923c", fontSize: 10, padding: "1px 6px", borderRadius: 10, border: "1px solid rgba(251,146,60,0.3)" }}>{earlyTodayCount}⚠</span>}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: "20px 24px 32px", overflowY: "auto" }}>
          {activeTab === "clock" && (
            <div style={{ animation: "slideIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, marginTop: 8 }}>
                <div style={{ position: "relative", width: 140, height: 140 }}>
                  {isClockedIn && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #22c55e", animation: "pulseRing 2s ease-out infinite", pointerEvents: "none" }} />}
                  <div style={{ width: 140, height: 140, borderRadius: "50%", background: isClockedIn ? "radial-gradient(circle at 35% 35%, rgba(34,197,94,0.25), rgba(16,185,129,0.1))" : "radial-gradient(circle at 35% 35%, rgba(99,102,241,0.2), rgba(30,41,59,0.8))", border: `2px solid ${isClockedIn ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.5s", boxShadow: isClockedIn ? "0 0 40px rgba(34,197,94,0.15)" : "0 0 40px rgba(99,102,241,0.1)" }}>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em", color: isClockedIn ? "#4ade80" : "#6366f1", marginBottom: 4 }}>{isClockedIn ? "ACTIVE" : "OFFLINE"}</div>
                    {isClockedIn ? <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", fontFamily: "'DM Mono', monospace", animation: "blink 2s ease-in-out infinite" }}>{formatDuration(liveElapsed)}</div> : <div style={{ fontSize: 32, marginTop: 4 }}>⏱</div>}
                    {isClockedIn && clockInTime && <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>since {formatShortTime(new Date(clockInTime))}</div>}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Today", value: formatDuration(totalToday + (isClockedIn ? liveElapsed : 0)), color: "#6366f1" },
                  { label: "Sessions", value: todayEntries.length || 0, color: "#8b5cf6" },
                  { label: "Status", value: isClockedIn ? "IN" : "OUT", color: isClockedIn ? "#22c55e" : "#ef4444" },
                ].map((s) => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "#4b5563", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {eodStatus && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, marginBottom: 12, background: eodStatus.type === "overdue" ? "rgba(239,68,68,0.1)" : eodStatus.type === "warning" ? "rgba(251,146,60,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${eodStatus.type === "overdue" ? "rgba(239,68,68,0.3)" : eodStatus.type === "warning" ? "rgba(251,146,60,0.25)" : "rgba(255,255,255,0.05)"}`, animation: eodStatus.type === "overdue" ? "shakeIn 0.5s ease" : "none" }}>
                  <span>{eodStatus.type === "overdue" ? "🚨" : eodStatus.type === "warning" ? "⏰" : "🏁"}</span>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                    {eodStatus.type === "overdue" ? <><span style={{ color: "#ef4444", fontWeight: 500 }}>PAST END OF DAY</span><span style={{ color: "#6b7280" }}> · {formatDuration(Math.abs(eodStatus.minsLeft) * 60000)} overtime</span></> : eodStatus.type === "warning" ? <><span style={{ color: "#fb923c", fontWeight: 500 }}>{eodStatus.minsLeft}m until end of day</span><span style={{ color: "#6b7280" }}> · {endTimeLabel}</span></> : <span style={{ color: "#6b7280" }}>End of day {endTimeLabel} · {Math.floor(eodStatus.minsLeft/60)}h {eodStatus.minsLeft%60}m left</span>}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, marginBottom: 14, background: geoStatus === "fetching" ? "rgba(251,191,36,0.06)" : geoStatus === "ok" ? "rgba(34,197,94,0.06)" : "rgba(99,102,241,0.06)", border: `1px solid ${geoStatus === "fetching" ? "rgba(251,191,36,0.2)" : geoStatus === "ok" ? "rgba(34,197,94,0.2)" : "rgba(99,102,241,0.15)"}` }}>
                {geoStatus === "fetching" ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #fbbf24", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", flexShrink: 0 }} /> : <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: geoStatus === "ok" ? "#22c55e" : "#6366f1", boxShadow: `0 0 8px ${geoStatus === "ok" ? "#22c55e" : "#6366f1"}` }} />}
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: geoStatus === "fetching" ? "#fbbf24" : geoStatus === "ok" ? "#4ade80" : "#818cf8" }}>
                  {geoStatus === "fetching" ? "Acquiring GPS…" : geoStatus === "ok" ? "Location captured ✓" : `GPS ready · required to punch ${isClockedIn ? "out" : "in"}`}
                </div>
              </div>

              {isClockedIn && activeLocation && <div style={{ marginBottom: 14 }}><LocationCard location={activeLocation} label="CLOCKED IN AT" timestamp={clockInTime} accent="#22c55e" /></div>}
              {!isClockedIn && lastEarlyMins > 0 && <EarlyBadge minsEarly={lastEarlyMins} />}

              <div style={{ marginTop: 14 }}><SwipeButton isClockedIn={isClockedIn} onSwipe={handleSwipe} disabled={swipeDisabled} /></div>
              <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: "#374151", fontFamily: "'DM Mono', monospace" }}>
                {swipeDisabled ? "Waiting for GPS lock…" : `Drag to ${isClockedIn ? "clock out" : "clock in"} · GPS captured on swipe`}
              </div>
            </div>
          )}

          {activeTab === "log" && (
            <div style={{ animation: "slideIn 0.3s ease" }}>
              {entries.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "#374151", fontFamily: "'DM Mono', monospace", fontSize: 13, gap: 12 }}>
                  <div style={{ fontSize: 36 }}>📋</div><div>No sessions yet</div>
                </div>
              ) : (
                <>
                  <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                    <div><div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>TOTAL</div><div style={{ fontSize: 18, fontWeight: 700, color: "#a5b4fc", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{formatDuration(entries.reduce((s, e) => s + ((e.clockOut || Date.now()) - e.clockIn), 0))}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>SESSIONS</div><div style={{ fontSize: 18, fontWeight: 700, color: "#a5b4fc", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{entries.length}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#4b5563", fontFamily: "'DM Mono', monospace" }}>EARLY OUTS</div><div style={{ fontSize: 18, fontWeight: 700, color: entries.filter(e => e.earlyMins > 0).length > 0 ? "#fb923c" : "#374151", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{entries.filter(e => e.earlyMins > 0).length}</div></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Time", "Location", "Duration"].map((c) => <div key={c} style={{ fontSize: 10, color: "#374151", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textAlign: c === "Duration" ? "right" : "left" }}>{c.toUpperCase()}</div>)}
                  </div>
                  {entries.map((e, i) => <LogEntry key={e.id} entry={e} index={i} endHour={endHour} endMinute={endMinute} />)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
