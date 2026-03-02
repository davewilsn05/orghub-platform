import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatIcsDate, escapeIcs } from "@/lib/ics-helpers";

/** Include events up to this many days in the past so they don't vanish immediately. */
const PAST_DAYS = 30;

export const dynamic = "force-dynamic";

type RouteParams = { orgSlug: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { orgSlug } = await params;
  const supabase = createServiceClient();

  // Resolve org
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // 30 days ago cutoff
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PAST_DAYS);

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, slug, description, location, start, end, category")
    .eq("org_id", org.id)
    .eq("is_published", true)
    .gte("start", cutoff.toISOString())
    .order("start", { ascending: true });

  if (error) {
    console.error("[calendar/feed] Supabase error:", error.message);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }

  const calName = `${org.name} Events`;
  const uidDomain = `${org.slug}.orghub.app`;
  const now = formatIcsDate(new Date());

  const vevents = (events || []).map((ev) => {
    const uid = `${ev.id}@${uidDomain}`;
    const dtstart = formatIcsDate(ev.start);
    const dtend = ev.end ? formatIcsDate(ev.end) : dtstart;

    const lines = [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${escapeIcs(ev.title)}`,
      `LOCATION:${escapeIcs(ev.location || "")}`,
      `DESCRIPTION:${escapeIcs(ev.description || "")}`,
    ];

    if (ev.category) {
      lines.push(`CATEGORIES:${escapeIcs(ev.category)}`);
    }

    lines.push("STATUS:CONFIRMED", "END:VEVENT");
    return lines.join("\r\n");
  });

  const ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escapeIcs(org.name)}//Events//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(calName)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    ...vevents,
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
