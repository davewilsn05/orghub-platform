import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function slugify(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgRole = user.app_metadata?.org_role as string | undefined;
  if (!orgRole || !["admin", "board"].includes(orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const body = await request.json() as {
    title: string; slug: string; description?: string | null;
    location?: string | null; start: string; end?: string | null;
    category?: string | null; is_published: boolean;
    rsvp_enabled: boolean; rsvp_limit?: number | null;
  };

  if (!body.title || !body.slug || !body.start) {
    return NextResponse.json({ error: "title, slug, and start are required" }, { status: 400 });
  }

  const service = createServiceClient();

  // Ensure slug is unique within org (append suffix if needed)
  let finalSlug = slugify(body.slug);
  const { data: existing } = await service
    .from("events")
    .select("id")
    .eq("org_id", orgId)
    .eq("slug", finalSlug)
    .maybeSingle();

  if (existing) finalSlug = `${finalSlug}-${Date.now()}`;

  const { data: event, error } = await service
    .from("events")
    .insert({
      org_id: orgId,
      title: body.title,
      slug: finalSlug,
      description: body.description ?? null,
      location: body.location ?? null,
      start: body.start,
      end: body.end ?? null,
      category: body.category ?? null,
      is_published: body.is_published,
      rsvp_enabled: body.rsvp_enabled,
      rsvp_limit: body.rsvp_limit ?? null,
      created_by: user.id,
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(event, { status: 201 });
}
