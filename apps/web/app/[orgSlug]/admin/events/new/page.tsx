import { EventForm } from "../EventForm";

type Props = { params: Promise<{ orgSlug: string }> };

export const metadata = { title: "Create Event — Admin" };

export default async function NewEventPage({ params }: Props) {
  const { orgSlug } = await params;

  return (
    <div style={{ padding: "2rem", maxWidth: "760px" }}>
      <a href={`/${orgSlug}/admin/events`} style={{ fontSize: "0.825rem", color: "#9ca3af", textDecoration: "none" }}>
        ← Events
      </a>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0.75rem 0 1.75rem" }}>Create event</h1>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.75rem" }}>
        <EventForm orgSlug={orgSlug} />
      </div>
    </div>
  );
}
