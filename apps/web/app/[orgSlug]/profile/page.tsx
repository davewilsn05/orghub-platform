"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  interval: string;
  stripe_price_id: string | null;
};

type Subscription = {
  id: string;
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  membership_plans: { name: string; price_cents: number; interval: string } | null;
} | null;

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [sub, setSub] = useState<Subscription>(null);
  const [duesPaidThrough, setDuesPaidThrough] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [subRes, plansRes] = await Promise.all([
        fetch("/api/membership/subscription"),
        fetch("/api/admin/membership-plans"),
      ]);
      if (subRes.ok) {
        const json = await subRes.json() as { subscription: Subscription; dues_paid_through: string | null };
        setSub(json.subscription);
        setDuesPaidThrough(json.dues_paid_through);
      }
      if (plansRes.ok) {
        const json = await plansRes.json() as { plans: Plan[] };
        setPlans(json.plans.filter((p) => p.stripe_price_id));
      }
      setLoading(false);
    }
    void load();
  }, []);

  async function handleSubscribe(planId: string) {
    setActionLoading(true);
    setError(null);
    const res = await fetch("/api/checkout/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const json = await res.json() as { url?: string; error?: string };
    if (!res.ok || !json.url) { setError(json.error ?? "Failed to start checkout."); setActionLoading(false); return; }
    window.location.href = json.url;
  }

  async function handleManageBilling() {
    setActionLoading(true);
    setError(null);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const json = await res.json() as { url?: string; error?: string };
    if (!res.ok || !json.url) { setError(json.error ?? "Failed to open billing portal."); setActionLoading(false); return; }
    window.location.href = json.url;
  }

  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const isPastDue = sub?.status === "past_due";
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <main style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>My Profile</h1>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Manage your membership and billing.
      </p>

      {success && (
        <div style={{ padding: "0.875rem 1rem", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "10px", color: "#065f46", fontWeight: 600, marginBottom: "1.5rem" }}>
          Payment successful — your membership is now active!
        </div>
      )}
      {canceled && (
        <div style={{ padding: "0.875rem 1rem", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "10px", color: "#92400e", marginBottom: "1.5rem" }}>
          Checkout was canceled. Your membership was not charged.
        </div>
      )}
      {error && (
        <div style={{ padding: "0.875rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#b91c1c", marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      {/* Membership status */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 1rem" }}>Membership status</h2>
        {loading ? (
          <div style={{ color: "#9ca3af" }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
              <span style={{ color: "#6b7280" }}>Dues paid through</span>
              <span style={{ fontWeight: 700 }}>
                {duesPaidThrough
                  ? formatDate(duesPaidThrough + "T00:00:00")
                  : "—"}
              </span>
            </div>
            {sub && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "#6b7280" }}>Subscription</span>
                  <span style={{
                    fontWeight: 700,
                    color: isActive ? "#059669" : isPastDue ? "#d97706" : "#6b7280",
                  }}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </div>
                {sub.membership_plans && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "#6b7280" }}>Plan</span>
                    <span style={{ fontWeight: 600 }}>
                      {sub.membership_plans.name} — ${(sub.membership_plans.price_cents / 100).toFixed(2)}/{sub.membership_plans.interval}
                    </span>
                  </div>
                )}
                {sub.current_period_end && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "#6b7280" }}>Next renewal</span>
                    <span style={{ fontWeight: 600 }}>{formatDate(sub.current_period_end)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!loading && sub?.stripe_customer_id && isActive ? (
        <button onClick={handleManageBilling} disabled={actionLoading} style={{
          padding: "0.8rem 2rem", background: "var(--org-primary, #3b82f6)",
          color: "#fff", border: "none", borderRadius: "9px",
          fontWeight: 700, fontSize: "0.95rem",
          cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.7 : 1,
        }}>
          {actionLoading ? "Opening…" : "Manage billing →"}
        </button>
      ) : !loading && plans.length > 0 ? (
        <div>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>Available plans</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {plans.map((plan) => (
              <div key={plan.id} style={{
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
                padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{plan.name}</div>
                  {plan.description && <div style={{ color: "#6b7280", fontSize: "0.825rem", marginTop: "0.2rem" }}>{plan.description}</div>}
                  <div style={{ color: "var(--org-primary, #3b82f6)", fontWeight: 700, marginTop: "0.35rem" }}>
                    ${(plan.price_cents / 100).toFixed(2)} / {plan.interval}
                  </div>
                </div>
                <button onClick={() => handleSubscribe(plan.id)} disabled={actionLoading} style={{
                  padding: "0.6rem 1.25rem", background: "var(--org-primary, #3b82f6)",
                  color: "#fff", border: "none", borderRadius: "8px",
                  fontWeight: 700, fontSize: "0.875rem",
                  cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.7 : 1,
                  whiteSpace: "nowrap",
                }}>
                  Subscribe →
                </button>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: "#9ca3af" }}>
            Secure checkout powered by Stripe.
          </p>
        </div>
      ) : !loading ? (
        <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
          No membership plans are currently available. Contact your administrator.
        </div>
      ) : null}
    </main>
  );
}
