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

  function handleCreated(inv: { email: string; token: string; role: string; expires_at: string }) {
    const isDev = window.location.hostname === "localhost";
    const base = isDev
      ? `${window.location.origin}?org=${orgSlug}`
      : `${window.location.protocol}//${orgSlug}.${window.location.host}`;
    const url = `${base}/join?token=${inv.token}`;
    setNewLink({ email: inv.email, url });
    setInvites((prev) => [{ ...inv, id: crypto.randomUUID(), accepted_at: null, created_at: new Date().toISOString() }, ...prev]);
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
            Share this link with them (email sending coming soon):
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
              onClick={() => { navigator.clipboard.writeText(newLink.url); }}
              style={{
                padding: "0.4rem 0.9rem", background: "#fff", border: "1px solid #d1d5db",
                borderRadius: "6px", fontSize: "0.78rem", fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Copy
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
          <InviteTable invites={past} dim />
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

function InviteTable({ invites, dim }: { invites: Invite[]; dim?: boolean }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", marginBottom: "0.5rem", opacity: dim ? 0.7 : 1 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
            {["Email", "Role", "Status", "Expires"].map((h) => (
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
                  {new Date(inv.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
