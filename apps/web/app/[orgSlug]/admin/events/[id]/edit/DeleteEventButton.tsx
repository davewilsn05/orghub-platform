"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteEventButton({ eventId, orgSlug }: { eventId: string; orgSlug: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const res = await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      setError(json.error ?? "Failed to delete event.");
      setDeleting(false);
      setConfirming(false);
      return;
    }
    router.push(`/${orgSlug}/admin/events`);
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.8rem", color: "#dc2626" }}>{error}</span>
        <button onClick={() => setError(null)} style={{ fontSize: "0.8rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}>
          Dismiss
        </button>
      </div>
    );
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.825rem", color: "#374151" }}>Delete this event permanently?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: "0.4rem 0.875rem", background: "#dc2626", color: "#fff",
            border: "none", borderRadius: "6px", fontWeight: 700,
            fontSize: "0.8rem", cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.7 : 1,
          }}
        >
          {deleting ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={deleting}
          style={{
            padding: "0.4rem 0.875rem", background: "#fff", color: "#374151",
            border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 600,
            fontSize: "0.8rem", cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        padding: "0.5rem 1rem", background: "#fff", border: "1px solid #fca5a5",
        borderRadius: "7px", color: "#dc2626", fontWeight: 600,
        fontSize: "0.825rem", cursor: "pointer",
      }}
    >
      Delete event
    </button>
  );
}
