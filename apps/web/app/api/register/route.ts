import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json() as {
    adminName: string;
    email: string;
    password: string;
    orgName: string;
    orgSlug: string;
    orgType: string;
  };

  const { adminName, email, password, orgName, orgSlug } = body;

  if (!adminName || !email || !password || !orgName || !orgSlug) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const slugClean = orgSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slugClean) {
    return NextResponse.json({ error: "Invalid org slug." }, { status: 400 });
  }

  const supabase = await createServiceClient();

  // Check slug availability
  const existingResult = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slugClean)
    .maybeSingle();
  if (existingResult.data) {
    return NextResponse.json(
      { error: "That portal URL is already taken. Try another." },
      { status: 409 }
    );
  }

  // Create auth user (service role can create without email confirmation)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: adminName },
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Failed to create account." },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // Create organization row
  const orgResult = await supabase
    .from("organizations")
    .insert({
      slug: slugClean,
      name: orgName,
      plan: "free" as const,
      feature_events: true,
      feature_committees: true,
      feature_newsletters: false,
      feature_messaging: false,
      feature_volunteers: false,
      feature_zoom: false,
      feature_documents: false,
      feature_member_directory: true,
    })
    .select("id, slug")
    .single();

  if (orgResult.error || !orgResult.data) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Failed to create organization." }, { status: 500 });
  }

  const org = orgResult.data as { id: string; slug: string };

  // Create admin profile
  const profileResult = await supabase
    .from("profiles")
    .insert({
      id: userId,
      org_id: org.id,
      email,
      full_name: adminName,
      role: "admin" as const,
      is_active: true,
    });

  if (profileResult.error) {
    await supabase.auth.admin.deleteUser(userId);
    await supabase.from("organizations").delete().eq("id", org.id);
    return NextResponse.json({ error: "Failed to create admin profile." }, { status: 500 });
  }

  // Embed org_id in auth user app_metadata so JWT hook can read it
  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { org_id: org.id, org_role: "admin" },
  });

  return NextResponse.json({ orgSlug: org.slug }, { status: 201 });
}
