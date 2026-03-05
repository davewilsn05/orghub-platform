"use client";

import { useState, useEffect } from "react";

type Props = {
  eventId: string;
  initialStatus: string | null;
  rsvpLimit: number | null;
  rsvpCount: number;
};

export function RsvpButton({ eventId, initialStatus, rsvpLimit, rsvpCount }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [count, setCount] = useState(rsvpCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rsvpToast, setRsvpToast] = useState<string | null>(null);

  const isAttending = status === "attending";
  const atCapacity = rsvpLimit !== null && count >= rsvpLimit && !isAttending;

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  // Auto-dismiss RSVP toast after 3 seconds
  useEffect(() => {
    if (!rsvpToast) return;
    const t = setTimeout(() => setRsvpToast(null), 3000);
    return () => clearTimeout(t);
  }, [rsvpToast]);

  async function toggle() {
    if (loading || atCapacity) return;
    setLoading(true);
    setError(null);
    const method = isAttending ? "DELETE" : "POST";
    const res = await fetch(`/api/events/${eventId}/rsvp`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify({ status: "attending" }) : undefined,
    });
    if (res.ok) {
      if (isAttending) {
        setStatus(null);
        setCount((c) => c - 1);
        setRsvpToast("RSVP cancelled.");
      } else {
        setStatus("attending");
        setCount((c) => c + 1);
        setRsvpToast("RSVP confirmed!");
      }
    } else {
      const json = await res.json().catch(() => ({})) as { error?: string };
      setError(json.error ?? "Could not update your RSVP. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={toggle}
          disabled={loading || atCapacity}
          aria-label={atCapacity ? "This event is at capacity" : isAttending ? "Cancel your RSVP" : "RSVP to this event"}
          title={atCapacity ? "This event is at capacity" : undefined}
          style={{
            padding: "0.75rem 2rem", borderRadius: "9px",
            fontWeight: 700, fontSize: "0.95rem", cursor: (loading || atCapacity) ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            background: isAttending ? "#d1fae5" : atCapacity ? "#f3f4f6" : "var(--org-primary, #3b82f6)",
            color: isAttending ? "#065f46" : atCapacity ? "#9ca3af" : "#fff",
            border: isAttending ? "1px solid #6ee7b7" : atCapacity ? "1px solid #e5e7eb" : "none",
          }}
        >
          {loading ? "Updating…" : isAttending ? "✓ Attending — click to cancel" : atCapacity ? "Event is full" : "RSVP →"}
        </button>
        {rsvpLimit && (
          <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>
            {count} / {rsvpLimit} spots filled
          </span>
        )}
      </div>
      {rsvpToast && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.825rem", color: "#059669", fontWeight: 600 }}>
          ✓ {rsvpToast}
        </div>
      )}
      {error && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.825rem", color: "#dc2626", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontWeight: 700, fontSize: "0.875rem", padding: 0, lineHeight: 1 }}>×</button>
        </div>
      )}
    </div>
  );
}
