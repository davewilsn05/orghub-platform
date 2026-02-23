import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json() as {
    token: string;
    fullName: string;
    password: string;
  };

  const { token, fullName, password } = body;
  if (!token || !fullName || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const service = createServiceClient();

  // Look up the invite
  const { data: invite } = await service
    .from("invites")
    .select("id, org_id, email, role, accepted_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return NextResponse.json({ error: "Invite link is invalid or has expired." }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: "This invite has already been used." }, { status: 409 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "This invite link has expired. Ask your admin for a new one." }, { status: 410 });
  }

  // Get org slug for redirect
  const { data: org } = await service
    .from("organizations")
    .select("slug")
    .eq("id", invite.org_id)
    .maybeSingle();

  if (!org) {
    return NextResponse.json({ error: "Organization not found." }, { status: 404 });
  }

  // Create auth user
  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Failed to create account." },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  // Create profile
  const { error: profileError } = await service.from("profiles").insert({
    id: userId,
    org_id: invite.org_id,
    email: invite.email,
    full_name: fullName,
    role: invite.role as "member" | "committee_chair" | "board" | "admin",
    is_active: true,
  });

  if (profileError) {
    await service.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Failed to create profile." }, { status: 500 });
  }

  // Set app_metadata so JWT hook has org context
  await service.auth.admin.updateUserById(userId, {
    app_metadata: { org_id: invite.org_id, org_role: invite.role },
  });

  // Mark invite accepted
  await service
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ orgSlug: org.slug }, { status: 201 });
}
