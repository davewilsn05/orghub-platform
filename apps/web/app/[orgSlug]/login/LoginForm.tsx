"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  orgName: string;
  primaryColor: string;
  orgSlug: string;
  redirectTo?: string;
}

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("wrong password")) {
    return "Incorrect email or password.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }
  if (m.includes("user not found") || m.includes("no user")) {
    return "No account found with that email address.";
  }
  return "Sign-in failed. Please check your credentials and try again.";
}

export function LoginForm({ orgName, primaryColor, orgSlug, redirectTo }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Handle magic-link implicit flow: extract tokens from hash and establish session
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    if (params.get("type") !== "magiclink") return;

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return;

    const supabase = createClient();
    (async () => {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) {
        console.error("[LoginForm] setSession error", sessionError);
        setError("Magic link expired or invalid. Please request a new one.");
        return;
      }
      window.location.replace(redirectTo ?? "/");
    })().catch((err) => {
      console.error("[LoginForm] magic link error", err);
      setError("Something went wrong. Please try signing in again.");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(friendlyAuthError(authError.message));
      setLoading(false);
      return;
    }

    // Redirect to the referring page or dashboard
    window.location.href = redirectTo ?? "/";
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
      setError("Sign in with Google failed. Please try again or use email and password.");
      setGoogleLoading(false);
    }
    // On success, browser navigates to Google — no further action needed here.
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: window.location.origin + "/auth/callback",
    });
    setForgotSent(true);
    setForgotLoading(false);
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
              Password
            </label>
            <button
              type="button"
              onClick={() => { setForgotMode(true); setForgotEmail(email.trim()); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--org-primary, #3b82f6)", fontSize: "0.8rem", padding: 0 }}
            >
              Forgot password?
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%", padding: "0.65rem 0.875rem",
                paddingRight: "3.5rem",
                border: "1px solid #d1d5db", borderRadius: "8px",
                fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                background: "#fff",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: "0.625rem", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.75rem", fontWeight: 600, color: "#6b7280",
                padding: "0.125rem 0.375rem",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {forgotMode && (
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1rem" }}>
            {forgotSent ? (
              <p style={{ fontSize: "0.875rem", color: "#059669", margin: 0 }}>✓ Check your inbox for a password reset link.</p>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0 }}>Enter your email to receive a reset link.</p>
                <input
                  type="email" required value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.875rem", boxSizing: "border-box", outline: "none" }}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="submit" disabled={forgotLoading} style={{ padding: "0.5rem 1rem", background: "var(--org-primary, #3b82f6)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.875rem", cursor: forgotLoading ? "not-allowed" : "pointer", opacity: forgotLoading ? 0.7 : 1 }}>
                    {forgotLoading ? "Sending…" : "Send reset link"}
                  </button>
                  <button type="button" onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }} style={{ padding: "0.5rem 0.875rem", background: "#fff", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", color: "#374151" }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

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
