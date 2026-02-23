"use client";

import { useState } from "react";

const ROLES = [
  { value: "member", label: "Member" },
  { value: "committee_chair", label: "Committee Chair" },
  { value: "board", label: "Board" },
  { value: "admin", label: "Admin" },
];

type CreatedInvite = { email: string; token: string; role: string; expires_at: string };

type Props = { orgSlug: string; onCreated: (invite: CreatedInvite) => void };

export function InviteForm({ orgSlug, onCreated }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const json = await res.json() as CreatedInvite & { error?: string };

    if (!res.ok) {
      setError(json.error ?? "Failed to create invite.");
      setLoading(false);
      return;
    }

    setEmail("");
    setRole("member");
    setLoading(false);
    onCreated(json);
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem 0.875rem", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "0.9rem", background: "#fff",
    outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: "12px", padding: "1.5rem", marginBottom: "1.75rem",
    }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem" }}>Invite a member</h2>

      {error && (
        <div style={{ padding: "0.65rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", alignItems: "end" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
            Email address
          </label>
          <input style={inputStyle} type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
            Role
          </label>
          <select style={{ ...inputStyle, width: "auto" }} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} style={{
          padding: "0.6rem 1.25rem", background: "var(--org-primary, #3b82f6)",
          color: "#fff", border: "none", borderRadius: "8px",
          fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, whiteSpace: "nowrap",
        }}>
          {loading ? "Sending…" : "Send invite"}
        </button>
      </div>
    </form>
  );
}
