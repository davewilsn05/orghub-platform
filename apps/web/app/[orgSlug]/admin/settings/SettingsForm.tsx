"use client";

import { useState } from "react";

type OrgSettings = {
  name: string;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  feature_events: boolean;
  feature_committees: boolean;
  feature_newsletters: boolean;
  feature_messaging: boolean;
  feature_volunteers: boolean;
  feature_zoom: boolean;
  feature_documents: boolean;
  feature_member_directory: boolean;
};

export function SettingsForm({ initial }: { initial: OrgSettings }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof OrgSettings>(key: K, val: OrgSettings[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json() as { error?: string };
    if (!res.ok) { setError(json.error ?? "Failed to save."); setLoading(false); return; }
    setSaved(true);
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.6rem 0.875rem", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "0.9rem", boxSizing: "border-box", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem",
  };

  const FEATURES: { key: keyof OrgSettings; label: string }[] = [
    { key: "feature_events", label: "Events & RSVPs" },
    { key: "feature_committees", label: "Committees" },
    { key: "feature_newsletters", label: "Newsletters" },
    { key: "feature_messaging", label: "Messaging" },
    { key: "feature_volunteers", label: "Volunteer Hub" },
    { key: "feature_zoom", label: "Zoom Meetings" },
    { key: "feature_documents", label: "Documents" },
    { key: "feature_member_directory", label: "Member Directory" },
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {error && (
        <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* Identity */}
      <Section title="Organization">
        <div>
          <label style={labelStyle}>Organization name</label>
          <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
      </Section>

      {/* Branding */}
      <Section title="Branding">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Primary color</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input type="color" value={form.primary_color ?? "#3b82f6"}
                onChange={(e) => set("primary_color", e.target.value)}
                style={{ width: "40px", height: "36px", padding: "2px", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" }} />
              <input style={{ ...inputStyle, flex: 1 }} value={form.primary_color ?? ""}
                onChange={(e) => set("primary_color", e.target.value)} placeholder="#3b82f6" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Secondary color</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input type="color" value={form.secondary_color ?? "#1e40af"}
                onChange={(e) => set("secondary_color", e.target.value)}
                style={{ width: "40px", height: "36px", padding: "2px", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer" }} />
              <input style={{ ...inputStyle, flex: 1 }} value={form.secondary_color ?? ""}
                onChange={(e) => set("secondary_color", e.target.value)} placeholder="#1e40af" />
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Logo URL</label>
            <input style={inputStyle} type="url" value={form.logo_url ?? ""}
              onChange={(e) => set("logo_url", e.target.value || null)} placeholder="https://…" />
          </div>
          <div>
            <label style={labelStyle}>Favicon URL</label>
            <input style={inputStyle} type="url" value={form.favicon_url ?? ""}
              onChange={(e) => set("favicon_url", e.target.value || null)} placeholder="https://…" />
          </div>
        </div>
        {form.logo_url && (
          <div>
            <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginBottom: "0.5rem" }}>Logo preview</p>
            <img src={form.logo_url} alt="Logo preview" style={{ height: "48px", objectFit: "contain" }} />
          </div>
        )}
      </Section>

      {/* Features */}
      <Section title="Features">
        <p style={{ fontSize: "0.82rem", color: "#9ca3af", marginTop: "-0.5rem", marginBottom: "0.75rem" }}>
          Toggle which modules appear in your portal navigation.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {FEATURES.map(({ key, label }) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.875rem" }}>
              <input type="checkbox" checked={form[key] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--org-primary, #3b82f6)" }} />
              {label}
            </label>
          ))}
        </div>
      </Section>

      {/* Submit */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button type="submit" disabled={loading} style={{
          padding: "0.7rem 1.75rem", background: "var(--org-primary, #3b82f6)",
          color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700,
          fontSize: "0.925rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Saving…" : "Save settings"}
        </button>
        {saved && <span style={{ color: "#059669", fontSize: "0.875rem", fontWeight: 600 }}>✓ Saved</span>}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0, color: "#111827" }}>{title}</h2>
      {children}
    </div>
  );
}
