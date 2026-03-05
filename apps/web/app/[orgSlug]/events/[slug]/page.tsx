import { notFound } from "next/navigation";
import { loadOrgConfig } from "@/lib/org/loader";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { RsvpButton } from "./RsvpButton";
import { TicketSection } from "./TicketSection";

type Props = {
  params: Promise<{ orgSlug: string; slug: string }>;
  searchParams: Promise<{ ticket_success?: string }>;
};

export default async function EventDetailPage({ params, searchParams }: Props) {
  const { orgSlug, slug } = await params;
  const { ticket_success } = await searchParams;
  const org = await loadOrgConfig();
  const supabase = await createClient();
  const service = createServiceClient();

  type FullEvent = {
    id: string; title: string; slug: string; description: string | null;
    location: string | null; start: string; end: string | null;
    category: string | null; rsvp_enabled: boolean; rsvp_limit: number | null;
    is_zoom_meeting: boolean; zoom_url: string | null; zoom_passcode: string | null;
  };

  const { data: event } = await service
    .from("events")
    .select("id, title, slug, description, location, start, end, category, rsvp_enabled, rsvp_limit, is_zoom_meeting, zoom_url, zoom_passcode")
    .eq("org_id", org.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!event) notFound();
  const ev = event as FullEvent;

  const { count: rsvpCount } = await service
    .from("event_rsvps")
    .select("id", { count: "exact", head: true })
    .eq("event_id", ev.id)
    .eq("status", "attending");

  const { data: { user } } = await supabase.auth.getUser();
  let userRsvpStatus: string | null = null;
  if (user) {
    const { data: rsvp } = await service
      .from("event_rsvps")
      .select("status")
      .eq("event_id", ev.id)
      .eq("profile_id", user.id)
      .maybeSingle();
    userRsvpStatus = (rsvp as { status: string } | null)?.status ?? null;
  }

  const start = new Date(ev.start);
  const end = ev.end ? new Date(ev.end) : null;
  const dateStr = start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const timeStr = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endStr = end ? ` – ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "";

  const spotsLeft = ev.rsvp_limit !== null ? ev.rsvp_limit - (rsvpCount ?? 0) : null;

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <a href={`/${orgSlug}/events`} style={{ fontSize: "0.825rem", color: "#9ca3af", textDecoration: "none" }}>
        ← Events
      </a>

      {ticket_success === "1" && (
        <div style={{
          marginTop: "1.25rem",
          padding: "1rem 1.25rem", background: "#d1fae5",
          border: "1px solid #6ee7b7", borderRadius: "10px",
          color: "#065f46", fontWeight: 600, fontSize: "0.95rem",
        }}>
          🎟️ Your tickets have been purchased! Check your email for a confirmation receipt.
        </div>
      )}

      <div style={{ marginTop: "1.25rem", marginBottom: "2rem" }}>
        {ev.category && (
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--org-primary, #3b82f6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
            {ev.category}
          </div>
        )}
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1.25rem", lineHeight: 1.15 }}>{ev.title}</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.75rem" }}>
          <MetaRow icon="📅" text={`${dateStr} at ${timeStr}${endStr}`} ariaLabel="Date and time" />
          {ev.location && <MetaRow icon="📍" text={ev.location} ariaLabel="Location" />}
          {ev.rsvp_enabled && <MetaRow icon="👥" text={`${rsvpCount ?? 0} attending${ev.rsvp_limit ? ` · ${ev.rsvp_limit} spots total` : ""}`} ariaLabel="Attendees" />}
        </div>

        {ev.rsvp_enabled && user && (
          <RsvpButton
            eventId={ev.id}
            initialStatus={userRsvpStatus}
            rsvpLimit={ev.rsvp_limit}
            rsvpCount={rsvpCount ?? 0}
          />
        )}
        {ev.rsvp_enabled && !user && (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <a href={`/${orgSlug}/login?redirect=/${orgSlug}/events/${ev.slug}`} style={{
              display: "inline-block", padding: "0.75rem 2rem",
              background: "var(--org-primary, #3b82f6)", color: "#fff",
              borderRadius: "9px", fontWeight: 700, textDecoration: "none",
            }}>
              Sign in to RSVP →
            </a>
            {spotsLeft !== null && (
              <span style={{ fontSize: "0.85rem", color: spotsLeft <= 5 ? "#dc2626" : "#6b7280" }}>
                {spotsLeft <= 0 ? "Event is full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
              </span>
            )}
          </div>
        )}
      </div>

      <TicketSection eventId={ev.id} />

      {ev.description && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>About this event</h2>
          <div style={{ color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{ev.description}</div>
        </div>
      )}

      {ev.is_zoom_meeting && ev.zoom_url && org.features.zoom && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "1.25rem" }}>
          <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>📹 This is a Zoom meeting</div>
          <a href={ev.zoom_url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.9rem" }}>
            Join on Zoom →
          </a>
          {ev.zoom_passcode && (
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.35rem" }}>Passcode: {ev.zoom_passcode}</div>
          )}
        </div>
      )}
    </main>
  );
}

function MetaRow({ icon, text, ariaLabel }: { icon: string; text: string; ariaLabel?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.95rem", color: "#374151" }} aria-label={ariaLabel}>
      <span aria-hidden="true" style={{ flexShrink: 0 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
