import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

  const body = await request.json() as { title: string; slug: string; body: string; status: string };
  if (!body.title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const status = (["draft", "published", "sent"].includes(body.status) ? body.status : "draft") as "draft" | "published" | "sent";
  const content = { text: body.body ?? "" };

  const service = createServiceClient();

  // Deduplicate slug
  let slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const { data: existing } = await service.from("newsletters").select("id").eq("org_id", orgId).eq("slug", slug).maybeSingle();
  if (existing) slug = `${slug}-${Date.now()}`;

  const { data, error } = await service
    .from("newsletters")
    .insert({
      org_id: orgId,
      title: body.title,
      slug,
      content,
      status,
      created_by: user.id,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
