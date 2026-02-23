"use client";

import { useState } from "react";

const ORG_TYPES = [
  "Elks Lodge", "Rotary Club", "Lions Club", "VFW Post", "American Legion",
  "HOA", "Cultural Society", "Civic Organization", "Youth League",
  "Garden Club", "Service Club", "Other",
];

type Step = 1 | 2 | 3;

export function RegisterForm() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: account
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: org
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgType, setOrgType] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function handleOrgNameChange(val: string) {
    setOrgName(val);
    if (!slugEdited) {
      setOrgSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminName, email, password, orgName, orgSlug, orgType }),
    });

    const json = await res.json() as { orgSlug?: string; error?: string };

    if (!res.ok || !json.orgSlug) {
      setError(json.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    // Redirect to the new portal
    const isDev = window.location.hostname === "localhost";
    window.location.href = isDev
      ? `http://localhost:3000?org=${json.orgSlug}`
      : `https://${json.orgSlug}.orghub.app`;
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.875rem",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "0.95rem", outline: "none",
    background: "#fff", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.875rem",
    fontWeight: 600, marginBottom: "0.4rem", color: "#374151",
  };

  return (
    <div style={{ width: "100%", maxWidth: "460px" }}>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} style={{
            flex: 1, height: "4px", borderRadius: "2px",
            background: s <= step ? "#3b82f6" : "#e5e7eb",
            transition: "background 0.2s",
          }} />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Step 1: Your account ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Create your account</h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>
              You'll be the admin for your organization's portal.
            </p>
            <div>
              <label style={labelStyle}>Your name</label>
              <input style={inputStyle} type="text" required value={adminName}
                onChange={(e) => setAdminName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" required minLength={6} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <button type="button" onClick={() => setStep(2)}
              disabled={!adminName || !email || !password}
              style={{
                padding: "0.75rem", background: "#3b82f6", color: "#fff",
                border: "none", borderRadius: "8px", fontWeight: 700,
                fontSize: "1rem", cursor: "pointer", marginTop: "0.25rem",
                opacity: (!adminName || !email || !password) ? 0.5 : 1,
              }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Your org ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Set up your organization</h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>
              This becomes your portal address: <strong>{orgSlug || "your-org"}.orghub.app</strong>
            </p>
            <div>
              <label style={labelStyle}>Organization name</label>
              <input style={inputStyle} type="text" required value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                placeholder="Pasadena Elks Lodge #672" />
            </div>
            <div>
              <label style={labelStyle}>Portal URL</label>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
                <span style={{ padding: "0.65rem 0.75rem", background: "#f3f4f6", color: "#6b7280", fontSize: "0.875rem", borderRight: "1px solid #d1d5db", whiteSpace: "nowrap" }}>
                  orghub.app/
                </span>
                <input
                  style={{ ...inputStyle, border: "none", borderRadius: 0, flex: 1 }}
                  type="text" required value={orgSlug}
                  onChange={(e) => { setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugEdited(true); }}
                  placeholder="pasadena-elks-672"
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Organization type</label>
              <select style={inputStyle} value={orgType} onChange={(e) => setOrgType(e.target.value)}>
                <option value="">Select type…</option>
                {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setStep(1)}
                style={{ padding: "0.75rem 1rem", background: "#f3f4f6", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
                ← Back
              </button>
              <button type="button" onClick={() => setStep(3)}
                disabled={!orgName || !orgSlug}
                style={{
                  flex: 1, padding: "0.75rem", background: "#3b82f6", color: "#fff",
                  border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "1rem",
                  cursor: "pointer", opacity: (!orgName || !orgSlug) ? 0.5 : 1,
                }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Looks good?</h2>

            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <Row label="Admin" value={`${adminName} (${email})`} />
              <Row label="Org name" value={orgName} />
              <Row label="Portal URL" value={`${orgSlug}.orghub.app`} />
              {orgType && <Row label="Type" value={orgType} />}
              <Row label="Plan" value="Free (self-hosted)" />
            </div>

            {error && (
              <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setStep(2)}
                style={{ padding: "0.75rem 1rem", background: "#f3f4f6", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
                ← Back
              </button>
              <button type="submit" disabled={loading}
                style={{
                  flex: 1, padding: "0.75rem", background: loading ? "#93c5fd" : "#3b82f6",
                  color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700,
                  fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer",
                }}>
                {loading ? "Creating your portal…" : "Launch my portal →"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
