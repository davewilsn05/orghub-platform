"use client";

import { useEffect, useState } from "react";

type TicketType = {
  id: string;
  name: string;
  price_cents: number;
  quantity_available: number | null;
  stripe_price_id: string | null;
};

export function TicketSection({ eventId }: { eventId: string }) {
  const [types, setTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/ticket-types`)
      .then((r) => r.json())
      .then((json: { types: TicketType[] }) => {
        const withStripe = json.types.filter((t) => t.stripe_price_id);
        setTypes(withStripe);
        if (withStripe.length > 0) setSelected(withStripe[0].id);
      })
      .catch(() => {/* no tickets */})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading || types.length === 0) return null;

  const selectedType = types.find((t) => t.id === selected) ?? types[0];
  const totalCents = selectedType.price_cents * quantity;

  async function handleCheckout() {
    setChecking(true);
    setError(null);
    const res = await fetch(`/api/checkout/event/${eventId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketTypeId: selected, quantity }),
    });
    const json = await res.json() as { url?: string; error?: string };
    if (!res.ok || !json.url) {
      setError(json.error ?? "Could not start checkout.");
      setChecking(false);
      return;
    }
    window.location.href = json.url;
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem", marginTop: 0 }}>Tickets</h2>

      {error && (
        <div style={{ padding: "0.6rem 0.875rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.825rem", marginBottom: "0.75rem" }}>
          {error}
        </div>
      )}

      {types.length > 1 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
            Ticket type
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{ width: "100%", padding: "0.6rem 0.875rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.9rem", background: "#fff" }}
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — ${(t.price_cents / 100).toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
            Quantity
          </label>
          <input
            type="number" min={1} max={selectedType.quantity_available ?? 20}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            style={{ width: "80px", padding: "0.6rem 0.875rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "0.9rem" }}
          />
        </div>
        <div style={{ marginTop: "1.4rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--org-primary, #3b82f6)" }}>
          ${(totalCents / 100).toFixed(2)} total
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={checking}
        style={{
          padding: "0.75rem 2rem", background: "var(--org-primary, #3b82f6)",
          color: "#fff", border: "none", borderRadius: "9px",
          fontWeight: 700, fontSize: "0.95rem",
          cursor: checking ? "not-allowed" : "pointer", opacity: checking ? 0.7 : 1,
        }}
      >
        {checking ? "Redirecting…" : `Buy ${quantity > 1 ? `${quantity} ` : ""}ticket${quantity !== 1 ? "s" : ""} →`}
      </button>
    </div>
  );
}
