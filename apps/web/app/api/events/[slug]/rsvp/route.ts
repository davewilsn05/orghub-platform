import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const body = await request.json() as { status?: string };
  const status = (body.status ?? "attending") as "attending" | "not_attending" | "maybe";

  const service = createServiceClient();
  const { data: event } = await service
    .from("events")
    .select("id, rsvp_enabled, rsvp_limit")
    .eq("org_id", orgId)
    .eq("slug", slug)
    .maybeSingle();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const ev = event as { id: string; rsvp_enabled: boolean; rsvp_limit: number | null };
  if (!ev.rsvp_enabled) return NextResponse.json({ error: "RSVP not enabled for this event" }, { status: 400 });

  if (ev.rsvp_limit !== null && status === "attending") {
    const { count } = await service
      .from("event_rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", ev.id)
      .eq("status", "attending");
    if ((count ?? 0) >= ev.rsvp_limit) {
      return NextResponse.json({ error: "Event is at capacity" }, { status: 409 });
    }
  }

  const { error } = await service
    .from("event_rsvps")
    .upsert(
      { org_id: orgId, event_id: ev.id, profile_id: user.id, status },
      { onConflict: "event_id,profile_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const service = createServiceClient();
  const { data: event } = await service
    .from("events")
    .select("id")
    .eq("org_id", orgId)
    .eq("slug", slug)
    .maybeSingle();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  await service
    .from("event_rsvps")
    .delete()
    .eq("event_id", (event as { id: string }).id)
    .eq("profile_id", user.id);

  return NextResponse.json({ ok: true });
}
