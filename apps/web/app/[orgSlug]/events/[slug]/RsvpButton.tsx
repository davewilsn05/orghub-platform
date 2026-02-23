"use client";

import { useState } from "react";

type Props = {
  eventSlug: string;
  initialStatus: string | null;
  rsvpLimit: number | null;
  rsvpCount: number;
};

export function RsvpButton({ eventSlug, initialStatus, rsvpLimit, rsvpCount }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [count, setCount] = useState(rsvpCount);
  const [loading, setLoading] = useState(false);

  const isAttending = status === "attending";
  const atCapacity = rsvpLimit !== null && count >= rsvpLimit && !isAttending;

  async function toggle() {
    if (loading || atCapacity) return;
    setLoading(true);
    const method = isAttending ? "DELETE" : "POST";
    const res = await fetch(`/api/events/${eventSlug}/rsvp`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify({ status: "attending" }) : undefined,
    });
    if (res.ok) {
      if (isAttending) {
        setStatus(null);
        setCount((c) => c - 1);
      } else {
        setStatus("attending");
        setCount((c) => c + 1);
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <button
        onClick={toggle}
        disabled={loading || atCapacity}
        style={{
          padding: "0.75rem 2rem", borderRadius: "9px",
          fontWeight: 700, fontSize: "0.95rem", cursor: (loading || atCapacity) ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          background: isAttending ? "#d1fae5" : "var(--org-primary, #3b82f6)",
          color: isAttending ? "#065f46" : "#fff",
          border: isAttending ? "1px solid #6ee7b7" : "none",
        }}
      >
        {loading ? "Updating…" : isAttending ? "✓ You're going — cancel?" : atCapacity ? "Event is full" : "RSVP →"}
      </button>
      {rsvpLimit && (
        <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>
          {count} / {rsvpLimit} spots filled
        </span>
      )}
    </div>
  );
}
