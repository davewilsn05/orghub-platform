"use client";

import { useState, useMemo } from "react";

type EventRow = {
  id: string; title: string; start: string; is_published: boolean;
  location: string | null; category: string | null;
};

type Props = {
  events: EventRow[];
  orgSlug: string;
  rsvpCounts: Record<string, number>;
};

export function EventsTable({ events, orgSlug, rsvpCounts }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events
      .filter((ev) => {
        if (filter === "published" && !ev.is_published) return false;
        if (filter === "draft" && ev.is_published) return false;
        if (q && !ev.title.toLowerCase().includes(q) &&
          !(ev.location ?? "").toLowerCase().includes(q) &&
          !(ev.category ?? "").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const cmp = a.start.localeCompare(b.start);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [events, search, filter, sortDir]);

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.35rem 0.875rem", borderRadius: "999px", fontSize: "0.8rem",
    fontWeight: active ? 700 : 500, cursor: "pointer", border: "1px solid",
    borderColor: active ? "var(--org-primary, #3b82f6)" : "#e5e7eb",
    background: active ? "var(--org-primary-bg, #eff6ff)" : "#fff",
    color: active ? "var(--org-primary, #3b82f6)" : "#6b7280",
  });

  return (
    <>
      {/* Search + filters */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
        <input
          type="search"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "0.5rem 0.875rem", border: "1px solid #d1d5db",
            borderRadius: "8px", fontSize: "0.9rem", outline: "none",
            width: "220px", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button style={filterBtnStyle(filter === "all")} onClick={() => setFilter("all")}>All</button>
          <button style={filterBtnStyle(filter === "published")} onClick={() => setFilter("published")}>Published</button>
          <button style={filterBtnStyle(filter === "draft")} onClick={() => setFilter("draft")}>Draft</button>
        </div>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          title={`Currently sorted: ${sortDir === "desc" ? "newest first" : "oldest first"}. Click to reverse.`}
          style={{
            padding: "0.35rem 0.875rem", borderRadius: "8px", fontSize: "0.8rem",
            fontWeight: 600, cursor: "pointer",
            border: "1px solid var(--org-primary, #3b82f6)",
            background: "var(--org-primary-bg, #eff6ff)",
            color: "var(--org-primary, #3b82f6)", marginLeft: "auto",
          }}
        >
          {sortDir === "desc" ? "↓ Newest first" : "↑ Oldest first"}
        </button>
        {search && (
          <span aria-live="polite" aria-atomic="true" style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
            {filtered.length} of {events.length}
          </span>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflowX: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
            {search ? `No events match "${search}"` : "No events in this filter."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["Title", "Date", "Location", "Category", "RSVPs", "Status", ""].map((h) => (
                  <th key={h} style={{
                    padding: "0.75rem 1rem", textAlign: "left",
                    fontWeight: 600, color: "#6b7280", fontSize: "0.78rem",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => {
                const d = new Date(ev.start);
                const rsvpCount = rsvpCounts[ev.id] ?? 0;
                return (
                  <tr key={ev.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{
                      padding: "0.875rem 1rem", fontWeight: 600,
                      maxWidth: "240px", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }} title={ev.title}>
                      {ev.title}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#374151", whiteSpace: "nowrap" }}>
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      <span style={{ color: "#9ca3af", marginLeft: "0.4rem", fontSize: "0.8rem" }}>
                        {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ev.location ?? "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280" }}>{ev.category ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      {rsvpCount > 0 ? (
                        <a href={`/${orgSlug}/admin/events/${ev.id}/rsvps`} style={{
                          color: "var(--org-primary, #3b82f6)", fontWeight: 600,
                          textDecoration: "none", fontSize: "0.825rem",
                        }}>
                          {rsvpCount}
                        </a>
                      ) : (
                        <span style={{ color: "#d1d5db" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{
                        display: "inline-block", padding: "0.2rem 0.65rem",
                        borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: ev.is_published ? "#d1fae5" : "#f3f4f6",
                        color: ev.is_published ? "#065f46" : "#6b7280",
                      }}>
                        {ev.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <a href={`/${orgSlug}/admin/events/${ev.id}/edit`} style={{
                        color: "var(--org-primary, #3b82f6)", fontWeight: 600,
                        textDecoration: "none", fontSize: "0.825rem",
                      }}>
                        Edit
                      </a>
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
