"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Subscription = {
  id: string;
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  membership_plans: { name: string; price_cents: number; interval: string } | null;
} | null;

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  joined_at: string | null;
  created_at: string;
} | null;

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";
  const canceled = searchParams.get("canceled") === "1";

  const [profile, setProfile] = useState<Profile>(null);
  const [editName, setEditName] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [sub, setSub] = useState<Subscription>(null);
  const [duesPaidThrough, setDuesPaidThrough] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (isDirty) e.preventDefault();
  }, [isDirty]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  useEffect(() => {
    async function load() {
      const [profileRes, subRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/membership/subscription"),
      ]);
      if (profileRes.ok) {
        const json = await profileRes.json() as { profile: Profile };
        setProfile(json.profile);
        setEditName(json.profile?.full_name ?? "");
      }
      if (subRes.ok) {
        const json = await subRes.json() as { subscription: Subscription; dues_paid_through: string | null };
        setSub(json.subscription);
        setDuesPaidThrough(json.dues_paid_through);
      }
      setLoading(false);
    }
    void load();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: editName }),
    });
    const json = await res.json() as { error?: string };
    if (!res.ok) {
      setProfileError(json.error ?? "Failed to save.");
    } else {
      setProfile((p) => p ? { ...p, full_name: editName } : p);
      setIsDirty(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 5000);
    }
    setSavingProfile(false);
  }

  const isActive = sub?.status === "active" || sub?.status === "trialing";
  const isPastDue = sub?.status === "past_due";
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.6rem 0.875rem",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "0.9rem", boxSizing: "border-box", outline: "none",
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
      {/* Avatar */}
      {!loading && profile && (() => {
        const name = profile.full_name ?? profile.email;
        const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "var(--org-primary, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "1.2rem", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{profile.full_name ?? "—"}</div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>{profile.email}</div>
            </div>
          </div>
        );
      })()}
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>My Profile</h1>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Manage your account and membership.
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
      {/* Account info */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 1rem" }}>Account</h2>
        {loading ? (
          <div style={{ color: "#9ca3af" }}>Loading…</div>
        ) : (
          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                Display name
              </label>
              <input
                style={inputStyle}
                value={editName}
                onChange={(e) => { setEditName(e.target.value); setIsDirty(true); }}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                Email
              </label>
              <div style={{ padding: "0.6rem 0.875rem", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "0.9rem", color: "#6b7280" }}>
                {profile?.email ?? "—"}
              </div>
            </div>
            {profileError && (
              <div style={{ fontSize: "0.825rem", color: "#b91c1c" }}>{profileError}</div>
            )}
            {profileSaved && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.825rem", color: "#059669", fontWeight: 600, background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "6px", padding: "0.5rem 0.75rem" }}>
                <span>✓ Name updated.</span>
                <button onClick={() => setProfileSaved(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#059669", fontWeight: 700, fontSize: "0.875rem", padding: 0, lineHeight: 1 }}>×</button>
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={savingProfile || !editName.trim()}
                style={{
                  padding: "0.55rem 1.25rem", background: "var(--org-primary, #3b82f6)",
                  color: "#fff", border: "none", borderRadius: "7px",
                  fontWeight: 600, fontSize: "0.875rem",
                  cursor: savingProfile ? "not-allowed" : "pointer", opacity: savingProfile ? 0.7 : 1,
                }}
              >
                {savingProfile ? "Saving…" : "Save name"}
              </button>
            </div>
          </form>
        )}
      </div>

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
                {isPastDue && (
                  <div style={{ fontSize: "0.8rem", color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "6px", padding: "0.5rem 0.75rem" }}>
                    Your payment method needs attention.{" "}
                    <a href="membership" style={{ color: "#b45309", fontWeight: 700 }}>Update your billing</a>{" "}
                    to avoid service interruption.
                  </div>
                )}
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

      {/* Membership link */}
      {!loading && (
        <a href="membership" style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.7rem 1.5rem",
          background: "var(--org-primary, #3b82f6)", color: "#fff",
          borderRadius: "9px", fontWeight: 700, fontSize: "0.9rem",
          textDecoration: "none",
        }}>
          {isActive ? "Manage membership →" : "View membership plans →"}
        </a>
      )}
    </main>
  );
}
