"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EventData = {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string | null;
  category: string | null;
  is_published: boolean;
  rsvp_enabled: boolean;
  rsvp_limit: number | null;
};

type Props = {
  orgSlug: string;
  event?: EventData;
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

function slugify(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function EventForm({ orgSlug, event }: Props) {
  const router = useRouter();
  const isEdit = Boolean(event?.id);

  const [title, setTitle] = useState(event?.title ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [start, setStart] = useState(toDatetimeLocal(event?.start));
  const [end, setEnd] = useState(toDatetimeLocal(event?.end));
  const [category, setCategory] = useState(event?.category ?? "");
  const [isPublished, setIsPublished] = useState(event?.is_published ?? false);
  const [rsvpEnabled, setRsvpEnabled] = useState(event?.rsvp_enabled ?? false);
  const [rsvpLimit, setRsvpLimit] = useState<string>(event?.rsvp_limit?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugTouched) setSlug(slugify(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body = {
      title, slug, description: description || null,
      location: location || null, start, end: end || null,
      category: category || null, is_published: isPublished,
      rsvp_enabled: rsvpEnabled,
      rsvp_limit: rsvpLimit ? parseInt(rsvpLimit, 10) : null,
    };

    const url = isEdit ? `/api/admin/events/${event!.id}` : "/api/admin/events";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json() as { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push(`/${orgSlug}/admin/events`);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.6rem 0.875rem",
    border: "1px solid #d1d5db", borderRadius: "8px",
    fontSize: "0.9rem", background: "#fff", boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.8rem", fontWeight: 600,
    color: "#374151", marginBottom: "0.35rem",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {error && (
        <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#b91c1c", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      {/* Title + Slug */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} required value={title}
            onChange={(e) => handleTitleChange(e.target.value)} placeholder="Monthly Meeting" />
        </div>
        <div>
          <label style={labelStyle}>Slug *</label>
          <input style={inputStyle} required value={slug}
            onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugTouched(true); }}
            placeholder="monthly-meeting" />
        </div>
      </div>

      {/* Start + End */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Start *</label>
          <input style={inputStyle} type="datetime-local" required value={start}
            onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>End</label>
          <input style={inputStyle} type="datetime-local" value={end}
            onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      {/* Location + Category */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={location}
            onChange={(e) => setLocation(e.target.value)} placeholder="Main Lodge Hall" />
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} value={category}
            onChange={(e) => setCategory(e.target.value)} placeholder="Meeting, Social, Fundraiser…" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
          value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Details about the event…" />
      </div>

      {/* Toggles */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <Toggle label="Published" checked={isPublished} onChange={setIsPublished}
          hint="Members can see the event" />
        <Toggle label="RSVP enabled" checked={rsvpEnabled} onChange={setRsvpEnabled}
          hint="Show RSVP button on event page" />
      </div>

      {/* RSVP limit */}
      {rsvpEnabled && (
        <div style={{ maxWidth: "200px" }}>
          <label style={labelStyle}>RSVP limit (optional)</label>
          <input style={inputStyle} type="number" min={1} value={rsvpLimit}
            onChange={(e) => setRsvpLimit(e.target.value)} placeholder="No limit" />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
        <button type="submit" disabled={loading} style={{
          padding: "0.7rem 1.75rem", background: "var(--org-primary, #3b82f6)",
          color: "#fff", border: "none", borderRadius: "8px",
          fontWeight: 700, fontSize: "0.925rem", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </button>
        <a href={`/${orgSlug}/admin/events`} style={{
          padding: "0.7rem 1.25rem", background: "#f3f4f6", border: "1px solid #e5e7eb",
          borderRadius: "8px", fontWeight: 600, fontSize: "0.925rem",
          textDecoration: "none", color: "#374151",
        }}>
          Cancel
        </a>
      </div>
    </form>
  );
}

function Toggle({ label, checked, onChange, hint }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: "2px", width: "16px", height: "16px", accentColor: "var(--org-primary, #3b82f6)" }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{label}</div>
        {hint && <div style={{ fontSize: "0.78rem", color: "#9ca3af" }}>{hint}</div>}
      </div>
    </label>
  );
}
