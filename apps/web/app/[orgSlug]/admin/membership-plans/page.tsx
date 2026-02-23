"use client";

import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  interval: string;
  stripe_price_id: string | null;
  is_active: boolean;
};

export default function MembershipPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceDollars, setPriceDollars] = useState("");
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [stripePriceId, setStripePriceId] = useState("");

  async function load() {
    const res = await fetch("/api/admin/membership-plans");
    if (res.ok) {
      const json = await res.json() as { plans: Plan[] };
      setPlans(json.plans);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const price_cents = Math.round(parseFloat(priceDollars) * 100);
    if (isNaN(price_cents) || price_cents <= 0) {
      setError("Enter a valid price.");
      setCreating(false);
      return;
    }

    const res = await fetch("/api/admin/membership-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, description: description || null,
        price_cents, interval,
        stripe_price_id: stripePriceId || null,
      }),
    });

    const json = await res.json() as { error?: string };
    if (!res.ok) { setError(json.error ?? "Failed to create plan."); setCreating(false); return; }

    setName(""); setDescription(""); setPriceDollars(""); setStripePriceId(""); setInterval("year");
    setCreating(false);
    await load();
  }

  async function toggleActive(plan: Plan) {
    await fetch(`/api/admin/membership-plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !plan.is_active }),
    });
    await load();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.6rem 0.875rem", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "0.9rem", boxSizing: "border-box", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem",
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>Membership Plans</h1>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Create plans and link them to Stripe Price IDs for recurring dues collection.
      </p>

      {loading ? (
        <div style={{ color: "#9ca3af" }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {plans.length === 0 && (
            <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No plans yet.</div>
          )}
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
              padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center",
              opacity: plan.is_active ? 1 : 0.55,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.975rem" }}>{plan.name}</div>
                {plan.description && <div style={{ color: "#6b7280", fontSize: "0.825rem", marginTop: "0.2rem" }}>{plan.description}</div>}
                <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "var(--org-primary, #3b82f6)" }}>
                    ${(plan.price_cents / 100).toFixed(2)} / {plan.interval}
                  </span>
                  {plan.stripe_price_id ? (
                    <span style={{ fontSize: "0.75rem", background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "99px" }}>
                      Stripe linked
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "99px" }}>
                      No Stripe Price ID
                    </span>
                  )}
                  {!plan.is_active && (
                    <span style={{ fontSize: "0.75rem", background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: "99px" }}>
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => toggleActive(plan)} style={{
                padding: "0.45rem 1rem", border: "1px solid #d1d5db", borderRadius: "7px",
                background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                color: "#374151", whiteSpace: "nowrap",
              }}>
                {plan.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create form */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", marginTop: 0 }}>New plan</h2>
        {error && (
          <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Plan name *</label>
              <input style={inputStyle} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Annual Membership" />
            </div>
            <div>
              <label style={labelStyle}>Billing interval *</label>
              <select style={inputStyle} value={interval} onChange={(e) => setInterval(e.target.value as "month" | "year")}>
                <option value="year">Yearly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full membership benefits…" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Price (USD) *</label>
              <input style={inputStyle} type="number" min="0.50" step="0.01" required
                value={priceDollars} onChange={(e) => setPriceDollars(e.target.value)} placeholder="50.00" />
            </div>
            <div>
              <label style={labelStyle}>Stripe Price ID</label>
              <input style={inputStyle} value={stripePriceId} onChange={(e) => setStripePriceId(e.target.value)} placeholder="price_…" />
            </div>
          </div>
          <div>
            <button type="submit" disabled={creating} style={{
              padding: "0.7rem 1.75rem", background: "var(--org-primary, #3b82f6)",
              color: "#fff", border: "none", borderRadius: "8px",
              fontWeight: 700, fontSize: "0.925rem",
              cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1,
            }}>
              {creating ? "Creating…" : "Create plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
