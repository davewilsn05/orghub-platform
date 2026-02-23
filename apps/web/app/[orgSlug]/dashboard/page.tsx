import { loadOrgConfig } from "@/lib/org/loader";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "#666" }}>
        Members Portal
      </p>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0.5rem 0" }}>
        Welcome to {org.name}
      </h1>
      <p style={{ color: "#555" }}>{org.tagline}</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "1rem",
        marginTop: "2rem"
      }}>
        {org.features.events && <DashCard href={`/${orgSlug}/events`} title="Events" icon="🎭" desc="Upcoming events and RSVPs" />}
        {org.features.committees && <DashCard href={`/${orgSlug}/committees`} title="Committees" icon="🏛️" desc="Committee pages and goals" />}
        {org.features.messaging && <DashCard href={`/${orgSlug}/messages`} title="Messages" icon="💬" desc="Inbox and bulletins" />}
        {org.features.newsletters && <DashCard href={`/${orgSlug}/newsletters`} title="Newsletters" icon="📰" desc="Member newsletters" />}
        {org.features.volunteer && <DashCard href={`/${orgSlug}/volunteer`} title="Volunteer" icon="⭐" desc="Sign up to help out" />}
        {org.features.zoomMeetings && <DashCard href={`/${orgSlug}/meetings`} title="Meetings" icon="📹" desc="Upcoming Zoom meetings" />}
      </div>
    </main>
  );
}

function DashCard({ href, title, icon, desc }: { href: string; title: string; icon: string; desc: string }) {
  return (
    <a
      href={href}
      style={{
        display: "block",
        padding: "1.25rem",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#fff",
        cursor: "pointer",
        transition: "border-color 0.15s",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{desc}</div>
    </a>
  );
}
