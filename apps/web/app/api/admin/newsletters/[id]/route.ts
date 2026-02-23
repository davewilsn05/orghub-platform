import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
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
  const status = (["draft", "published", "sent"].includes(body.status) ? body.status : "draft") as "draft" | "published" | "sent";
  const content = { text: body.body ?? "" };

  const service = createServiceClient();

  const { data: existing } = await service.from("newsletters").select("id, status").eq("id", id).eq("org_id", orgId).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const prevStatus = (existing as { status: string }).status;

  const { error } = await service
    .from("newsletters")
    .update({
      title: body.title,
      slug: body.slug,
      content,
      status,
      published_at: status === "published" && prevStatus !== "published" ? new Date().toISOString() : undefined,
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgRole = user.app_metadata?.org_role as string | undefined;
  if (!orgRole || !["admin", "board"].includes(orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const service = createServiceClient();
  const { data: existing } = await service.from("newsletters").select("id").eq("id", id).eq("org_id", orgId).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await service.from("newsletters").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
