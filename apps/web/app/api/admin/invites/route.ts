import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail, inviteEmailHtml } from "@/lib/email/send";

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

  const body = await request.json() as { email: string; role?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const role = (body.role ?? "member") as "member" | "committee_chair" | "board" | "admin";

  const service = createServiceClient();

  // Check if already an active member
  const { data: existing } = await service
    .from("profiles")
    .select("id")
    .eq("org_id", orgId)
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "That email is already a member of this org." }, { status: 409 });
  }

  // Invalidate any prior pending invites for this email+org
  await service
    .from("invites")
    .delete()
    .eq("org_id", orgId)
    .eq("email", email)
    .is("accepted_at", null);

  const token = crypto.randomUUID();

  const { data: invite, error } = await service
    .from("invites")
    .insert({
      org_id: orgId,
      email,
      role,
      token,
      invited_by: user.id,
    })
    .select("id, token, email, role, expires_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const inv = invite as { id: string; token: string; email: string; role: string; expires_at: string };

  // Send invite email if SendGrid is configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      const { data: org } = await service.from("organizations").select("name, slug").eq("id", orgId).maybeSingle();
      if (org) {
        const orgData = org as { name: string; slug: string };
        const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";
        const isDev = process.env.NODE_ENV === "development";
        const joinUrl = isDev
          ? `http://localhost:3000/join?org=${orgData.slug}&token=${inv.token}`
          : `https://${orgData.slug}.${ROOT_DOMAIN}/join?token=${inv.token}`;
        await sendEmail({
          to: inv.email,
          subject: `You're invited to join ${orgData.name}`,
          html: inviteEmailHtml({ orgName: orgData.name, joinUrl }),
          fromName: orgData.name,
        });
      }
    } catch {
      // Email failed — invite was still created, link shown on screen
    }
  }

  return NextResponse.json(inv, { status: 201 });
}

export async function GET() {
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
  const { data } = await service
    .from("invites")
    .select("id, email, role, accepted_at, expires_at, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}
