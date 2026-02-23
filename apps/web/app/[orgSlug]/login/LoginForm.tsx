"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  orgName: string;
  primaryColor: string;
}

export function LoginForm({ orgName, primaryColor }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Redirect to dashboard — full reload so middleware picks up the new session
    window.location.href = "/";
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%", padding: "0.65rem 0.875rem",
            border: "1px solid #d1d5db", borderRadius: "8px",
            fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
            background: "#fff",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem", color: "#374151" }}>
          Password
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%", padding: "0.65rem 0.875rem",
            border: "1px solid #d1d5db", borderRadius: "8px",
            fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
            background: "#fff",
          }}
        />
      </div>

      {error && (
        <div style={{
          padding: "0.75rem 1rem", background: "#fef2f2",
          border: "1px solid #fecaca", borderRadius: "8px",
          color: "#b91c1c", fontSize: "0.875rem",
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "0.75rem",
          background: loading ? "#93c5fd" : (primaryColor || "var(--org-primary, #3b82f6)"),
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "0.25rem",
        }}
      >
        {loading ? "Signing in…" : `Sign in to ${orgName}`}
      </button>
    </form>
  );
}
