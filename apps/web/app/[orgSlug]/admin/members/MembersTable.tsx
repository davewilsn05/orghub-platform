"use client";

import { useState, useMemo } from "react";

type Profile = {
  id: string; full_name: string | null; email: string;
  role: string; is_active: boolean; joined_at: string | null; created_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin", board: "Board", committee_chair: "Committee Chair", member: "Member",
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin: { bg: "#dbeafe", color: "#1d4ed8" },
  board: { bg: "#ede9fe", color: "#6d28d9" },
  committee_chair: { bg: "#fef9c3", color: "#92400e" },
  member: { bg: "#f3f4f6", color: "#374151" },
};

type SortKey = "full_name" | "email" | "role" | "joined" | "is_active";

export function MembersTable({ members }: { members: Profile[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("joined");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = members.filter((m) => {
      if (!q) return true;
      return (
        (m.full_name?.toLowerCase().includes(q) ?? false) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
      );
    });

    return [...result].sort((a, b) => {
      let av = "", bv = "";
      if (sortKey === "full_name") { av = a.full_name ?? ""; bv = b.full_name ?? ""; }
      else if (sortKey === "email") { av = a.email; bv = b.email; }
      else if (sortKey === "role") { av = a.role; bv = b.role; }
      else if (sortKey === "is_active") { av = a.is_active ? "1" : "0"; bv = b.is_active ? "1" : "0"; }
      else { av = a.joined_at ?? a.created_at; bv = b.joined_at ?? b.created_at; }
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [members, search, sortKey, sortDir]);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: "#d1d5db", marginLeft: "4px" }}>↕</span>;
    return <span style={{ color: "var(--org-primary, #3b82f6)", marginLeft: "4px" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const thStyle: React.CSSProperties = {
    padding: "0.75rem 1rem", textAlign: "left",
    fontWeight: 600, color: "#6b7280", fontSize: "0.78rem",
    textTransform: "uppercase", letterSpacing: "0.05em",
    cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
  };

  return (
    <>
      {/* Search bar */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="search"
          placeholder="Search by name, email, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", maxWidth: "360px",
            padding: "0.55rem 0.875rem", border: "1px solid #d1d5db",
            borderRadius: "8px", fontSize: "0.9rem", outline: "none",
            boxSizing: "border-box",
          }}
        />
        {search && (
          <span style={{ marginLeft: "0.75rem", fontSize: "0.825rem", color: "#6b7280" }}>
            {filtered.length} of {members.length} members
          </span>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflowX: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
            No members match &ldquo;{search}&rdquo;
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                <th style={thStyle} onClick={() => toggleSort("full_name")}>
                  Name <SortIcon k="full_name" />
                </th>
                <th style={thStyle} onClick={() => toggleSort("email")}>
                  Email <SortIcon k="email" />
                </th>
                <th style={thStyle} onClick={() => toggleSort("role")}>
                  Role <SortIcon k="role" />
                </th>
                <th style={thStyle} onClick={() => toggleSort("is_active")}>
                  Status <SortIcon k="is_active" />
                </th>
                <th style={thStyle} onClick={() => toggleSort("joined")}>
                  Joined <SortIcon k="joined" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const roleStyle = ROLE_COLORS[m.role] ?? { bg: "#f3f4f6", color: "#374151" };
                const joined = m.joined_at ?? m.created_at;
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #f9fafb", opacity: m.is_active ? 1 : 0.55 }}>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>
                      {m.full_name ?? "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280" }}>{m.email}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        display: "inline-block", padding: "0.2rem 0.65rem",
                        borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: roleStyle.bg, color: roleStyle.color,
                      }}>
                        {ROLE_LABELS[m.role] ?? m.role}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        display: "inline-block", padding: "0.2rem 0.65rem",
                        borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: m.is_active ? "#d1fae5" : "#f3f4f6",
                        color: m.is_active ? "#065f46" : "#9ca3af",
                      }}>
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#9ca3af", fontSize: "0.82rem" }}>
                      {new Date(joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
