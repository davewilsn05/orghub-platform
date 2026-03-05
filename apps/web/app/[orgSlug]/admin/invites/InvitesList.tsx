"use client";

import { useState } from "react";
import { InviteForm } from "./InviteForm";

type Invite = {
  id: string; email: string; role: string;
  accepted_at: string | null; expires_at: string; created_at: string;
  token?: string;
};

type Props = { orgSlug: string; initial: Invite[] };

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", board: "Board", committee_chair: "Committee Chair", member: "Member",
};

export function InvitesList({ orgSlug, initial }: Props) {
  const [invites, setInvites] = useState<Invite[]>(initial);
  const [newLink, setNewLink] = useState<{ email: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  function handleCreated(inv: { email: string; token: string; role: string; expires_at: string }) {
    const isDev = window.location.hostname === "localhost";
    const base = isDev
      ? `${window.location.origin}?org=${orgSlug}`
      : `${window.location.protocol}//${orgSlug}.${window.location.host}`;
    const url = `${base}/join?token=${inv.token}`;
    setNewLink({ email: inv.email, url });
    setInvites((prev) => [{ ...inv, id: crypto.randomUUID(), accepted_at: null, created_at: new Date().toISOString() }, ...prev]);
  }

  async function handleResend(inv: Invite) {
    setResending(inv.id);
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inv.email, role: inv.role }),
    });
    const json = await res.json() as { token?: string; email?: string; role?: string; expires_at?: string; error?: string };
    if (res.ok && json.token) {
      const isDev = window.location.hostname === "localhost";
      const base = isDev
        ? `${window.location.origin}?org=${orgSlug}`
        : `${window.location.protocol}//${orgSlug}.${window.location.host}`;
      const url = `${base}/join?token=${json.token}`;
      setNewLink({ email: inv.email, url });
      // Refresh invites list to show new pending invite
      setInvites((prev) => [
        { id: crypto.randomUUID(), email: inv.email, role: inv.role, accepted_at: null, created_at: new Date().toISOString(), expires_at: json.expires_at ?? new Date(Date.now() + 7 * 86400000).toISOString(), token: json.token },
        ...prev.filter((i) => i.id !== inv.id),
      ]);
    }
    setResending(null);
  }

  const pending = invites.filter((i) => !i.accepted_at && new Date(i.expires_at) > new Date());
  const past = invites.filter((i) => i.accepted_at || new Date(i.expires_at) <= new Date());

  return (
    <div>
      <InviteForm orgSlug={orgSlug} onCreated={handleCreated} />

      {/* Invite link banner */}
      {newLink && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px",
          padding: "1rem 1.25rem", marginBottom: "1.5rem",
          display: "flex", flexDirection: "column", gap: "0.5rem",
        }}>
          <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#166534" }}>
            ✓ Invite created for {newLink.email}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#374151" }}>
            Share this link — an invite email has also been sent:
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <code style={{
              flex: 1, background: "#fff", border: "1px solid #d1d5db", borderRadius: "6px",
              padding: "0.4rem 0.75rem", fontSize: "0.78rem", color: "#374151",
              wordBreak: "break-all",
            }}>
              {newLink.url}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newLink.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 3500);
              }}
              style={{
                padding: "0.4rem 0.9rem", background: copied ? "#f0fdf4" : "#fff",
                border: `1px solid ${copied ? "#86efac" : "#d1d5db"}`,
                borderRadius: "6px", fontSize: "0.78rem", fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
                color: copied ? "#166534" : "inherit",
                transition: "all 0.15s",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            Pending ({pending.length})
          </h2>
          <InviteTable invites={pending} />
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <h2 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "1.75rem 0 0.75rem" }}>
            Accepted / Expired
          </h2>
          <InviteTable invites={past} dim onResend={handleResend} resending={resending} />
        </>
      )}

      {invites.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af", fontSize: "0.875rem" }}>
          No invites sent yet.
        </div>
      )}
    </div>
  );
}

function InviteTable({ invites, dim, onResend, resending }: {
  invites: Invite[];
  dim?: boolean;
  onResend?: (inv: Invite) => void;
  resending?: string | null;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflowX: "auto", marginBottom: "0.5rem", opacity: dim ? 0.75 : 1 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
            {["Email", "Role", "Status", "Expires", ...(onResend ? [""] : [])].map((h) => (
              <th key={h} style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invites.map((inv) => {
            const expired = new Date(inv.expires_at) <= new Date();
            const status = inv.accepted_at ? "Accepted" : expired ? "Expired" : "Pending";
            const statusStyle = {
              Accepted: { bg: "#d1fae5", color: "#065f46" },
              Expired: { bg: "#f3f4f6", color: "#9ca3af" },
              Pending: { bg: "#fef9c3", color: "#92400e" },
            }[status];

            return (
              <tr key={inv.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "0.875rem 1rem", fontWeight: 500 }}>{inv.email}</td>
                <td style={{ padding: "0.875rem 1rem", color: "#6b7280" }}>
                  {ROLE_LABELS[inv.role] ?? inv.role}
                </td>
                <td style={{ padding: "0.875rem 1rem" }}>
                  <span style={{
                    display: "inline-block", padding: "0.2rem 0.65rem",
                    borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                    background: statusStyle?.bg, color: statusStyle?.color,
                  }}>
                    {status}
                  </span>
                </td>
                <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.82rem" }}>
                  {new Date(inv.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} <span style={{ color: "#d1d5db" }}>UTC</span>
                </td>
                {onResend && (
                  <td style={{ padding: "0.875rem 1rem" }}>
                    {expired && !inv.accepted_at && (
                      <button
                        onClick={() => onResend(inv)}
                        disabled={resending === inv.id}
                        style={{
                          padding: "0.25rem 0.75rem", background: "#fff",
                          border: "1px solid #d1d5db", borderRadius: "6px",
                          fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                          color: "var(--org-primary, #3b82f6)",
                          opacity: resending === inv.id ? 0.6 : 1,
                        }}
                      >
                        {resending === inv.id ? "Sending…" : "Resend"}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
