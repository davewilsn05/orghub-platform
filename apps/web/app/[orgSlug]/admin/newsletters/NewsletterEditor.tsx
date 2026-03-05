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
  const [loading, setLoading] = useState<"save" | "publish" | "send" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendOk, setSendOk] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);

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
    setConfirmSend(false);
    const res = await fetch(`/api/admin/newsletters/${newsletter.id}/send`, { method: "POST" });
    const json = await res.json() as { error?: string; sent?: number };
    if (!res.ok) { setError(json.error ?? "Failed to send."); setLoading(null); return; }
    setSendOk(true);
    setLoading(null);
    setTimeout(() => router.push(`/${orgSlug}/admin/newsletters`), 4000);
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

      {/* Edit / Preview toggle */}
      <div>
        <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setPreview(false)}
            style={{
              padding: "0.4rem 1rem", border: "none",
              background: !preview ? "var(--org-primary-bg, #eff6ff)" : "transparent",
              fontSize: "0.85rem", fontWeight: preview ? 400 : 700,
              color: preview ? "#9ca3af" : "var(--org-primary, #3b82f6)",
              borderBottom: preview ? "2px solid transparent" : "2px solid var(--org-primary, #3b82f6)",
              borderRadius: "6px 6px 0 0",
              cursor: "pointer", marginBottom: "-1px",
            }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            style={{
              padding: "0.4rem 1rem", border: "none",
              background: preview ? "var(--org-primary-bg, #eff6ff)" : "transparent",
              fontSize: "0.85rem", fontWeight: preview ? 700 : 400,
              color: preview ? "var(--org-primary, #3b82f6)" : "#9ca3af",
              borderBottom: preview ? "2px solid var(--org-primary, #3b82f6)" : "2px solid transparent",
              borderRadius: "6px 6px 0 0",
              cursor: "pointer", marginBottom: "-1px",
            }}
          >
            Preview
          </button>
        </div>

        {preview ? (
          <div style={{
            minHeight: "380px", padding: "1.5rem",
            border: "1px solid #e5e7eb", borderRadius: "8px",
            background: "#fafafa",
          }}>
            {title && (
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem", marginTop: 0, color: "#111827" }}>
                {title}
              </h2>
            )}
            {body ? (
              <div style={{ color: "#374151", lineHeight: 1.8, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                {body}
              </div>
            ) : (
              <p style={{ color: "#9ca3af", fontStyle: "italic" }}>No content yet.</p>
            )}
          </div>
        ) : (
          <>
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
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0 }}>Plain text. Line breaks are preserved when displayed.</p>
              <span style={{ fontSize: "0.75rem", color: body.length > 10000 ? "#dc2626" : body.length > 5000 ? "#d97706" : "#9ca3af" }}>
                {body.length.toLocaleString()} characters{body.length > 10000 ? " — very long, may not deliver" : ""}
              </span>
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => submit("save")} disabled={!!loading} style={btnStyle()}>
          {loading === "save" ? "Saving…" : "Save draft"}
        </button>
        <button onClick={() => submit("publish")} disabled={!!loading || !title} style={btnStyle(true)}>
          {loading === "publish" ? "Publishing…" : newsletter?.status === "published" ? "Update" : "Publish →"}
        </button>
        {isEdit && newsletter?.status === "published" && !sendOk && (
          <button onClick={() => setConfirmSend(true)} disabled={!!loading} style={{
            ...btnStyle(), background: "#ecfdf5", color: "#065f46",
            border: "1px solid #6ee7b7",
          }}>
            {loading === "send" ? "Sending…" : "Send to members"}
          </button>
        )}
        <a href={`/${orgSlug}/admin/newsletters`} style={{ fontSize: "0.875rem", color: "#9ca3af", textDecoration: "none", marginLeft: "auto" }}>
          Cancel
        </a>
      </div>

      {confirmSend && (
        <div style={{ background: "#fff", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.875rem", color: "#374151", flex: 1 }}>
            Send this newsletter to all active members? This cannot be undone.
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={sendNewsletter} style={{ padding: "0.45rem 1rem", background: "#065f46", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
              Send now
            </button>
            <button onClick={() => setConfirmSend(false)} style={{ padding: "0.45rem 0.875rem", background: "#fff", border: "1px solid #d1d5db", borderRadius: "6px", fontWeight: 500, fontSize: "0.8rem", cursor: "pointer", color: "#374151" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
