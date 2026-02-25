"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  orgName: string;
  primaryColor: string;
  orgSlug: string;
}

export function LoginForm({ orgName, primaryColor, orgSlug }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);

    // Build callback URL — in dev, preserve the ?org= param so middleware
    // can resolve the org slug after Supabase redirects back.
    const params = new URLSearchParams(window.location.search);
    const orgParam = params.get("org") ?? orgSlug;
    const callbackUrl =
      window.location.origin +
      "/auth/callback" +
      (process.env.NODE_ENV === "development" ? `?org=${orgParam}` : "");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });

    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
    // On success, browser navigates to Google — no further action needed here.
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Google sign-in */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem",
          padding: "0.75rem",
          background: "#fff",
          color: "#374151",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.95rem",
          cursor: (googleLoading || loading) ? "not-allowed" : "pointer",
          opacity: (googleLoading || loading) ? 0.6 : 1,
        }}
      >
        {/* Google "G" logo */}
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        {googleLoading ? "Redirecting…" : "Sign in with Google"}
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        <span style={{ fontSize: "0.8rem", color: "#9ca3af", whiteSpace: "nowrap" }}>or sign in with email</span>
        <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
      </div>

      {/* Email / password form */}
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
          disabled={loading || googleLoading}
          style={{
            padding: "0.75rem",
            background: (loading || googleLoading) ? "#93c5fd" : (primaryColor || "var(--org-primary, #3b82f6)"),
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: (loading || googleLoading) ? "not-allowed" : "pointer",
            marginTop: "0.25rem",
          }}
        >
          {loading ? "Signing in…" : `Sign in to ${orgName}`}
        </button>
      </form>
    </div>
  );
}
