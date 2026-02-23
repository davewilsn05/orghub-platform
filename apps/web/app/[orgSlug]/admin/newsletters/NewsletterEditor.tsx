"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  orgSlug: string;
  newsletter?: { id: string; title: string; body: string; status: string };
};

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function NewsletterEditor({ orgSlug, newsletter }: Props) {
  const router = useRouter();
  const isEdit = Boolean(newsletter?.id);

  const [title, setTitle] = useState(newsletter?.title ?? "");
  const [body, setBody] = useState(newsletter?.body ?? "");
  const [slugTouched] = useState(isEdit);
  const [loading, setLoading] = useState<"save" | "publish" | "send" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendOk, setSendOk] = useState(false);

  async function submit(action: "save" | "publish") {
    setError(null);
    setLoading(action);
    const status = action === "publish" ? "published" : "draft";
    const slug = slugify(title) || `newsletter-${Date.now()}`;

    const url = isEdit ? `/api/admin/newsletters/${newsletter!.id}` : "/api/admin/newsletters";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, body, status }),
    });
    const json = await res.json() as { error?: string; id?: string };
    if (!res.ok) { setError(json.error ?? "Failed to save."); setLoading(null); return; }

    if (action === "publish") {
      router.push(`/${orgSlug}/admin/newsletters`);
    } else {
      if (!isEdit && json.id) {
        router.replace(`/${orgSlug}/admin/newsletters/${json.id}/edit`);
      }
      setLoading(null);
    }
  }

  async function sendNewsletter() {
    if (!newsletter?.id) return;
    setError(null);
    setLoading("send");
    const res = await fetch(`/api/admin/newsletters/${newsletter.id}/send`, { method: "POST" });
    const json = await res.json() as { error?: string; sent?: number };
    if (!res.ok) { setError(json.error ?? "Failed to send."); setLoading(null); return; }
    setSendOk(true);
    setLoading(null);
  }

  const btnStyle = (primary?: boolean): React.CSSProperties => ({
    padding: "0.65rem 1.25rem", borderRadius: "8px", fontWeight: 700,
    fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
    background: primary ? "var(--org-primary, #3b82f6)" : "#fff",
    color: primary ? "#fff" : "#374151",
    border: primary ? "none" : "1px solid #d1d5db",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {error && (
        <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}
      {sendOk && (
        <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", color: "#166534", fontSize: "0.875rem", fontWeight: 600 }}>
          ✓ Newsletter sent to all active members.
        </div>
      )}

      <div>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>Subject / Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="March Newsletter"
          required
          style={{ width: "100%", padding: "0.65rem 0.875rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "1rem", fontWeight: 600, boxSizing: "border-box", outline: "none" }}
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
          Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your newsletter here…"
          style={{
            width: "100%", minHeight: "380px", padding: "1rem",
            border: "1px solid #d1d5db", borderRadius: "8px",
            fontSize: "0.95rem", lineHeight: 1.7, resize: "vertical",
            fontFamily: "system-ui, sans-serif", boxSizing: "border-box", outline: "none",
          }}
        />
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.35rem" }}>Plain text. Line breaks are preserved when displayed.</p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => submit("save")} disabled={!!loading} style={btnStyle()}>
          {loading === "save" ? "Saving…" : "Save draft"}
        </button>
        <button onClick={() => submit("publish")} disabled={!!loading || !title} style={btnStyle(true)}>
          {loading === "publish" ? "Publishing…" : newsletter?.status === "published" ? "Update" : "Publish →"}
        </button>
        {isEdit && newsletter?.status === "published" && (
          <button onClick={sendNewsletter} disabled={!!loading || sendOk} style={{
            ...btnStyle(), background: "#ecfdf5", color: "#065f46",
            border: "1px solid #6ee7b7",
          }}>
            {loading === "send" ? "Sending…" : sendOk ? "✓ Sent" : "Send to members"}
          </button>
        )}
        <a href={`/${orgSlug}/admin/newsletters`} style={{ fontSize: "0.875rem", color: "#9ca3af", textDecoration: "none", marginLeft: "auto" }}>
          Cancel
        </a>
      </div>
    </div>
  );
}
