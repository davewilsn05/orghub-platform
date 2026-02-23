import { notFound } from "next/navigation";
import { loadOrgConfig } from "@/lib/org/loader";
import { createServiceClient } from "@/lib/supabase/server";
import { EventForm } from "../../EventForm";

type Props = { params: Promise<{ orgSlug: string; id: string }> };

export const metadata = { title: "Edit Event — Admin" };

export default async function EditEventPage({ params }: Props) {
  const { orgSlug, id } = await params;
  const org = await loadOrgConfig();
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug, description, location, start, end, category, is_published, rsvp_enabled, rsvp_limit")
    .eq("id", id)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!event) notFound();

  return (
    <div style={{ padding: "2rem", maxWidth: "760px" }}>
      <a href={`/${orgSlug}/admin/events`} style={{ fontSize: "0.825rem", color: "#9ca3af", textDecoration: "none" }}>
        ← Events
      </a>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0.75rem 0 1.75rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Edit event</h1>
        <DeleteEventButton eventId={id} orgSlug={orgSlug} />
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.75rem" }}>
        <EventForm orgSlug={orgSlug} event={{
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description,
          location: event.location,
          start: event.start,
          end: event.end ?? null,
          category: event.category,
          is_published: event.is_published,
          rsvp_enabled: event.rsvp_enabled,
          rsvp_limit: event.rsvp_limit,
        }} />
      </div>
    </div>
  );
}

function DeleteEventButton({ eventId, orgSlug }: { eventId: string; orgSlug: string }) {
  return (
    <form action={`/api/admin/events/${eventId}`} method="POST">
      <input type="hidden" name="_method" value="DELETE" />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("Delete this event? This cannot be undone.")) e.preventDefault();
        }}
        style={{
          padding: "0.5rem 1rem", background: "#fff", border: "1px solid #fca5a5",
          borderRadius: "7px", color: "#dc2626", fontWeight: 600,
          fontSize: "0.825rem", cursor: "pointer",
        }}
      >
        Delete event
      </button>
    </form>
  );
}
