import { loadOrgConfig } from "@/lib/org/loader";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();
  const supabase = await createClient();

  // Fetch upcoming events (next 3)
  type EventPreview = { id: string; title: string; start: string; location: string | null };
  const eventsResult = await supabase
    .from("events")
    .select("id, title, start, location")
    .eq("org_id", org.id)
    .eq("is_published", true)
    .gte("start", new Date().toISOString())
    .order("start", { ascending: true })
    .limit(3);
  const events = eventsResult.data as EventPreview[] | null;

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#888" }}>
        Members Portal
      </p>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0.5rem 0 2rem" }}>
        Welcome to {org.name}
      </h1>

      {/* Upcoming events strip */}
      {events && events.length > 0 && (
        <div style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "#555" }}>
            UPCOMING EVENTS
          </h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {events.map((ev) => (
              <a
                key={ev.id}
                href={`/${orgSlug}/events`}
                style={{
                  display: "block", padding: "1rem 1.25rem",
                  border: "1px solid #e5e7eb", borderRadius: "10px",
                  background: "#fff", textDecoration: "none", color: "inherit",
                  minWidth: "200px",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--org-primary)", fontWeight: 600, marginBottom: "0.25rem" }}>
                  {new Date(ev.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{ev.title}</div>
                {ev.location && <div style={{ fontSize: "0.8rem", color: "#888" }}>{ev.location}</div>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Feature modules */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "1rem",
      }}>
        {org.features.events && (
          <DashCard href={`/${orgSlug}/events`} title="Events" icon="🎭" desc="Upcoming events and RSVPs" />
        )}
        {org.features.committees && (
          <DashCard href={`/${orgSlug}/committees`} title="Committees" icon="🏛️" desc="Committee pages and goals" />
        )}
        {org.features.messaging && (
          <DashCard href={`/${orgSlug}/messages`} title="Messages" icon="💬" desc="Inbox and bulletins" />
        )}
        {org.features.newsletters && (
          <DashCard href={`/${orgSlug}/newsletters`} title="Newsletters" icon="📰" desc="Member newsletters" />
        )}
        {org.features.volunteers && (
          <DashCard href={`/${orgSlug}/volunteer`} title="Volunteer" icon="⭐" desc="Sign up to help out" />
        )}
        {org.features.zoom && (
          <DashCard href={`/${orgSlug}/meetings`} title="Meetings" icon="📹" desc="Upcoming Zoom meetings" />
        )}
        {org.features.memberDirectory && (
          <DashCard href={`/${orgSlug}/members`} title="Members" icon="👥" desc="Member directory" />
        )}
        {org.features.documents && (
          <DashCard href={`/${orgSlug}/documents`} title="Documents" icon="📂" desc="Bylaws and reports" />
        )}
      </div>
    </main>
  );
}

function DashCard({ href, title, icon, desc }: {
  href: string; title: string; icon: string; desc: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: "block", padding: "1.25rem",
        border: "1px solid #e5e7eb", borderRadius: "12px",
        background: "#fff", cursor: "pointer",
        textDecoration: "none", color: "inherit",
      }}
    >
      <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{desc}</div>
    </a>
  );
}
