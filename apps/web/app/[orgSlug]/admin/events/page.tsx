import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Events — Admin" };

type EventRow = {
  id: string; title: string; start: string; is_published: boolean;
  location: string | null; category: string | null;
};

export default async function AdminEventsPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, start, is_published, location, category")
    .eq("org_id", org.id)
    .order("start", { ascending: false });

  const events = data as EventRow[] | null;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Events</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {events?.length ?? 0} total
          </p>
        </div>
        <a href={`/${orgSlug}/admin/events/new`} style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.65rem 1.25rem",
          background: "var(--org-primary, #3b82f6)", color: "#fff",
          borderRadius: "8px", fontWeight: 700, fontSize: "0.875rem",
          textDecoration: "none",
        }}>
          ➕ Create event
        </a>
      </div>

      {!events?.length ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
          color: "#9ca3af",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📅</div>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No events yet</p>
          <a href={`/${orgSlug}/admin/events/new`} style={{
            color: "var(--org-primary, #3b82f6)", fontWeight: 600, fontSize: "0.875rem",
          }}>
            Create your first event →
          </a>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["Title", "Date", "Location", "Category", "Status", ""].map((h) => (
                  <th key={h} style={{
                    padding: "0.75rem 1rem", textAlign: "left",
                    fontWeight: 600, color: "#6b7280", fontSize: "0.78rem",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const d = new Date(ev.start);
                return (
                  <tr key={ev.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "0.875rem 1rem", fontWeight: 600 }}>{ev.title}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#374151" }}>
                      {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      <span style={{ color: "#9ca3af", marginLeft: "0.4rem", fontSize: "0.8rem" }}>
                        {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280" }}>{ev.location ?? "—"}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#6b7280" }}>{ev.category ?? "—"}</td>
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
                        color: "var(--org-primary, #3b82f6)", fontWeight: 600, textDecoration: "none",
                        fontSize: "0.825rem",
                      }}>
                        Edit
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
