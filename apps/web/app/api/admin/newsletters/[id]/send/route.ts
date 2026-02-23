import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail, newsletterEmailHtml } from "@/lib/email/send";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
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

  if (!process.env.SENDGRID_API_KEY) {
    return NextResponse.json({ error: "Email is not configured. Add SENDGRID_API_KEY to your environment." }, { status: 503 });
  }

  const service = createServiceClient();

  const { data: nl } = await service
    .from("newsletters")
    .select("id, title, content, status, sent_at")
    .eq("id", id)
    .eq("org_id", orgId)
    .maybeSingle();

  if (!nl) return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });

  const newsletter = nl as { id: string; title: string; content: { text?: string } | null; status: string; sent_at: string | null };

  if (newsletter.status === "draft") {
    return NextResponse.json({ error: "Publish the newsletter before sending." }, { status: 400 });
  }

  if (newsletter.sent_at) {
    return NextResponse.json({ error: "This newsletter has already been sent." }, { status: 409 });
  }

  // Fetch org info
  const { data: org } = await service.from("organizations").select("name, slug").eq("id", orgId).maybeSingle();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });
  const orgData = org as { name: string; slug: string };

  // Fetch all active member emails
  const { data: profiles } = await service
    .from("profiles")
    .select("email")
    .eq("org_id", orgId)
    .eq("is_active", true);

  const emails = (profiles ?? []).map((p) => (p as { email: string }).email).filter(Boolean);
  if (!emails.length) return NextResponse.json({ error: "No active members to send to." }, { status: 400 });

  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";
  const portalUrl = `https://${orgData.slug}.${ROOT_DOMAIN}`;
  const html = newsletterEmailHtml({
    orgName: orgData.name,
    title: newsletter.title,
    body: newsletter.content?.text ?? "",
    portalUrl,
  });

  try {
    // Send in batches of 500
    const BATCH = 500;
    for (let i = 0; i < emails.length; i += BATCH) {
      await sendEmail({ to: emails.slice(i, i + BATCH), subject: newsletter.title, html, fromName: orgData.name });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send email.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await service.from("newsletters").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", id);

  return NextResponse.json({ ok: true, sent: emails.length });
}
