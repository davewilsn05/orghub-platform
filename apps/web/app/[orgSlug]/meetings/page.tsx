import { loadOrgConfig } from "@/lib/org/loader";

export const metadata = { title: "Meetings" };

type Props = { params: Promise<{ orgSlug: string }> };

export default async function MeetingsPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = await loadOrgConfig();

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <a href={`/${orgSlug}/dashboard`} style={{ fontSize: "0.825rem", color: "#9ca3af", textDecoration: "none", display: "inline-block", marginBottom: "1.5rem" }}>
        ← Back to Dashboard
      </a>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>Meetings</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Upcoming Zoom meetings for {org.name} members.
      </p>
      <div style={{
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px",
        padding: "3rem 2rem", textAlign: "center", color: "#9ca3af",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📹</div>
        <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#374151" }}>Virtual meetings coming soon</p>
        <p style={{ fontSize: "0.875rem" }}>Zoom meeting integration is under development.</p>
      </div>
    </main>
  );
}
