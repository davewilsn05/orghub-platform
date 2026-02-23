"use client";

import { useState } from "react";

type Member = {
  id: string; full_name: string | null; email: string;
  role: string; joined_at: string | null; created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", board: "Board", committee_chair: "Chair", member: "Member",
};
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#dbeafe", color: "#1d4ed8" },
  board: { bg: "#ede9fe", color: "#6d28d9" },
  committee_chair: { bg: "#fef9c3", color: "#92400e" },
  member: { bg: "#f3f4f6", color: "#374151" },
};

export function MemberSearch({ members, orgSlug }: { members: Member[]; orgSlug: string }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? members.filter((m) =>
        (m.full_name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase())
      )
    : members;

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search members…"
        style={{
          width: "100%", padding: "0.65rem 1rem",
          border: "1px solid #d1d5db", borderRadius: "9px",
          fontSize: "0.9rem", marginBottom: "1.5rem",
          boxSizing: "border-box", outline: "none",
        }}
      />

      {filtered.length === 0 ? (
        <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No members found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
          {filtered.map((m) => {
            const roleStyle = ROLE_COLORS[m.role] ?? { bg: "#f3f4f6", color: "#374151" };
            const initials = (m.full_name ?? m.email).slice(0, 2).toUpperCase();
            const joined = m.joined_at ?? m.created_at;
            return (
              <div key={m.id} style={{
                background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: "12px", padding: "1.25rem",
                display: "flex", flexDirection: "column", gap: "0.5rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "var(--org-primary, #3b82f6)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.9rem", flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.full_name ?? "—"}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    display: "inline-block", padding: "0.2rem 0.6rem",
                    borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600,
                    background: roleStyle.bg, color: roleStyle.color,
                  }}>
                    {ROLE_LABELS[m.role] ?? m.role}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    {new Date(joined).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
