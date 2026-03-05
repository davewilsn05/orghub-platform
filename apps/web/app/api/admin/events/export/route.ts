import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { loadOrgConfig } from "@/lib/org/loader";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgRole = user.app_metadata?.org_role as string | undefined;
  if (!orgRole || !["admin", "board"].includes(orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await loadOrgConfig();
  const service = createServiceClient();

  const { data, error } = await service
    .from("events")
    .select("title, slug, start, end, location, category, is_published, rsvp_enabled, created_at")
    .eq("org_id", org.id)
    .order("start", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const headers = ["Title", "Slug", "Start", "End", "Location", "Category", "Published", "RSVP Enabled", "Created"];
  const csvRows = [
    headers.join(","),
    ...rows.map((ev) => [
      csvEscape(ev.title),
      csvEscape(ev.slug ?? ""),
      ev.start ? new Date(ev.start).toISOString() : "",
      ev.end ? new Date(ev.end).toISOString() : "",
      csvEscape(ev.location ?? ""),
      csvEscape(ev.category ?? ""),
      ev.is_published ? "Yes" : "No",
      ev.rsvp_enabled ? "Yes" : "No",
      ev.created_at ? new Date(ev.created_at).toISOString().slice(0, 10) : "",
    ].join(",")),
  ];

  const csv = csvRows.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="events-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

function csvEscape(val: string): string {
  if (/[",\r\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
  return val;
}
