import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";
import { EventsTable } from "./EventsTable";

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

  const LIMIT = 500;
  const { data, count } = await supabase
    .from("events")
    .select("id, title, start, is_published, location, category", { count: "exact" })
    .eq("org_id", org.id)
    .order("start", { ascending: false })
    .limit(LIMIT);

  const events = data as EventRow[] | null;
  const truncated = (count ?? 0) > LIMIT;

  // Fetch RSVP counts for all events
  const rsvpCounts: Record<string, number> = {};
  if (events && events.length > 0) {
    const { data: rsvpRows } = await supabase
      .from("event_rsvps")
      .select("event_id")
      .in("event_id", events.map((e) => e.id));
    for (const row of rsvpRows ?? []) {
      const r = row as { event_id: string };
      rsvpCounts[r.event_id] = (rsvpCounts[r.event_id] ?? 0) + 1;
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Events</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {truncated ? `${LIMIT}+ events` : `${events?.length ?? 0} total`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <a
            href="/api/admin/events/export"
            style={{
              padding: "0.6rem 1.1rem", background: "#f3f4f6",
              border: "1px solid #e5e7eb", borderRadius: "8px",
              fontWeight: 600, fontSize: "0.875rem", textDecoration: "none",
              color: "#374151",
            }}
          >
            Export CSV
          </a>
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
        <EventsTable events={events} orgSlug={orgSlug} rsvpCounts={rsvpCounts} />
      )}
    </div>
  );
}
