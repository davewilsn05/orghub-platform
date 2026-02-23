import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgRole = user.app_metadata?.org_role as string | undefined;
  if (orgRole !== "admin") return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const body = await request.json() as {
    name: string;
    primary_color: string | null;
    secondary_color: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    feature_events: boolean;
    feature_committees: boolean;
    feature_newsletters: boolean;
    feature_messaging: boolean;
    feature_volunteers: boolean;
    feature_zoom: boolean;
    feature_documents: boolean;
    feature_member_directory: boolean;
    stripe_publishable_key: string | null;
    stripe_secret_key: string | null;
    stripe_webhook_secret: string | null;
  };

  if (!body.name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const service = createServiceClient();
  const { error } = await service
    .from("organizations")
    .update({
      name: body.name.trim(),
      primary_color: body.primary_color || null,
      secondary_color: body.secondary_color || null,
      logo_url: body.logo_url || null,
      favicon_url: body.favicon_url || null,
      feature_events: body.feature_events,
      feature_committees: body.feature_committees,
      feature_newsletters: body.feature_newsletters,
      feature_messaging: body.feature_messaging,
      feature_volunteers: body.feature_volunteers,
      feature_zoom: body.feature_zoom,
      feature_documents: body.feature_documents,
      feature_member_directory: body.feature_member_directory,
      stripe_publishable_key: body.stripe_publishable_key || null,
      stripe_secret_key: body.stripe_secret_key || null,
      stripe_webhook_secret: body.stripe_webhook_secret || null,
    })
    .eq("id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
