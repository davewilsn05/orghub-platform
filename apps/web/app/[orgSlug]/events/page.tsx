import { loadOrgConfig } from "@/lib/org/loader";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export const metadata = { title: "Events" };

export default async function EventsPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = await createClient();

  type EventRow = {
    id: string; title: string; slug: string; start: string;
    location: string | null; category: string | null;
    description: string | null; rsvp_enabled: boolean;
  };

  const upcomingResult = await supabase
    .from("events")
    .select("id, title, slug, start, location, category, description, rsvp_enabled")
    .eq("org_id", org.id)
    .eq("is_published", true)
    .gte("start", new Date().toISOString())
    .order("start", { ascending: true });
  const upcoming = upcomingResult.data as EventRow[] | null;

  const pastResult = await supabase
    .from("events")
    .select("id, title, slug, start, location, category")
    .eq("org_id", org.id)
    .eq("is_published", true)
    .lt("start", new Date().toISOString())
    .order("start", { ascending: false })
    .limit(6);
  const past = pastResult.data as EventRow[] | null;

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>Events</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>{org.name}</p>

      {/* Upcoming */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#374151", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Upcoming
        </h2>
        {!upcoming?.length ? (
          <p style={{ color: "#9ca3af", fontStyle: "italic" }}>No upcoming events scheduled.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {upcoming.map((ev) => (
              <EventRow key={ev.id} event={ev} orgSlug={orgSlug} upcoming />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past && past.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#9ca3af", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Past Events
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {past.map((ev) => (
              <EventRow key={ev.id} event={ev} orgSlug={orgSlug} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function EventRow({
  event,
  orgSlug,
  upcoming = false,
}: {
  event: { id: string; title: string; start: string; location: string | null; category: string | null; description?: string | null; rsvp_enabled?: boolean };
  orgSlug: string;
  upcoming?: boolean;
}) {
  const start = new Date(event.start);
  const month = start.toLocaleDateString("en-US", { month: "short" });
  const day = start.getDate();
  const time = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div style={{
      display: "flex",
      gap: "1.25rem",
      padding: "1.25rem",
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      opacity: upcoming ? 1 : 0.6,
    }}>
      {/* Date badge */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center",
        minWidth: "52px", textAlign: "center",
      }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "var(--org-primary, #3b82f6)" }}>
          {month}
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1 }}>
          {day}
        </div>
      </div>

      {/* Details */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: "0.2rem" }}>{event.title}</div>
        <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: event.description ? "0.5rem" : 0 }}>
          {time}{event.location ? ` · ${event.location}` : ""}
          {event.category ? ` · ${event.category}` : ""}
        </div>
        {event.description && (
          <div style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.5 }}>
            {event.description.slice(0, 140)}{event.description.length > 140 ? "…" : ""}
          </div>
        )}
      </div>

      {/* RSVP badge */}
      {upcoming && event.rsvp_enabled && (
        <div style={{ alignSelf: "center" }}>
          <span style={{
            padding: "0.35rem 0.85rem",
            background: "var(--org-primary, #3b82f6)",
            color: "#fff",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}>
            RSVP
          </span>
        </div>
      )}
    </div>
  );
}
