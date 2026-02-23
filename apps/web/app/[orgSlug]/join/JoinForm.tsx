"use client";

import { useState } from "react";

type Props = { token: string; email: string; orgName: string; orgSlug: string };

export function JoinForm({ token, email, orgName, orgSlug }: Props) {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, fullName, password }),
    });

    const json = await res.json() as { orgSlug?: string; error?: string };

    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const isDev = window.location.hostname === "localhost";
    window.location.href = isDev
      ? `http://localhost:3000?org=${json.orgSlug}`
      : `https://${json.orgSlug}.orghub.app`;
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.875rem",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "0.95rem", boxSizing: "border-box", outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.8rem", fontWeight: 600,
    color: "#374151", marginBottom: "0.35rem",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#166534" }}>
        You were invited to join <strong>{orgName}</strong> as a member.
      </div>

      {error && (
        <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <div>
        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, background: "#f9fafb", color: "#6b7280" }}
          type="email" value={email} readOnly />
      </div>

      <div>
        <label style={labelStyle}>Your name</label>
        <input style={inputStyle} type="text" required value={fullName}
          onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" autoFocus />
      </div>

      <div>
        <label style={labelStyle}>Choose a password</label>
        <input style={inputStyle} type="password" required minLength={6} value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
      </div>

      <button type="submit" disabled={loading} style={{
        padding: "0.75rem", background: "var(--org-primary, #3b82f6)", color: "#fff",
        border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "1rem",
        cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
        marginTop: "0.25rem",
      }}>
        {loading ? "Creating account…" : `Join ${orgName} →`}
      </button>
    </form>
  );
}
