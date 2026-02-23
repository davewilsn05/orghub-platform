import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail, renewalReminderEmailHtml } from "@/lib/email/send";

// Runs weekly — sends renewal reminders 30 and 7 days before dues expiry
// Called by Vercel cron: schedule "0 9 * * 1" (every Monday 9am)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || cronSecret === "change-me-in-production") {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const now = new Date();

  const in30 = new Date(now); in30.setDate(now.getDate() + 30);
  const in29 = new Date(now); in29.setDate(now.getDate() + 29);
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);
  const in6 = new Date(now); in6.setDate(now.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  // Query members expiring ~30 days out (all orgs)
  const { data: members30 } = await service
    .from("profiles")
    .select("id, email, full_name, dues_paid_through, org_id, organizations(name, slug)")
    .eq("is_active", true)
    .not("email", "is", null)
    .gte("dues_paid_through", fmt(in29))
    .lte("dues_paid_through", fmt(in30));

  // Query members expiring ~7 days out
  const { data: members7 } = await service
    .from("profiles")
    .select("id, email, full_name, dues_paid_through, org_id, organizations(name, slug)")
    .eq("is_active", true)
    .not("email", "is", null)
    .gte("dues_paid_through", fmt(in6))
    .lte("dues_paid_through", fmt(in7));

  type ProfileRow = {
    id: string;
    email: string;
    full_name: string | null;
    dues_paid_through: string;
    org_id: string;
    organizations: { name: string; slug: string } | null;
  };

  const all = [...(members30 as ProfileRow[] ?? []), ...(members7 as ProfileRow[] ?? [])];
  const unique = all.filter((m, i, self) => self.findIndex((x) => x.id === m.id) === i);

  let successCount = 0;
  let errorCount = 0;

  for (const member of unique) {
    if (!member.email || !member.dues_paid_through) continue;
    try {
      const daysUntil = Math.ceil(
        (new Date(member.dues_paid_through).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const memberName = member.full_name ?? "Member";
      const orgName = member.organizations?.name ?? "your organization";
      const orgSlug = member.organizations?.slug ?? "";
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";
      const portalUrl = `https://${orgSlug}.${rootDomain}`;

      const subject = daysUntil <= 7
        ? `Action required: Your membership expires in ${daysUntil} days`
        : `Reminder: Your membership renews in ${daysUntil} days`;

      const html = renewalReminderEmailHtml({
        memberName,
        orgName,
        duesPaidThrough: member.dues_paid_through,
        daysUntilExpiry: daysUntil,
        renewalUrl: `${portalUrl}/membership`,
      });

      await sendEmail({ to: member.email, subject, html });
      console.log(`[renewal-reminders] Sent ${daysUntil}d reminder to ${member.email} (${orgName})`);
      successCount++;
    } catch (err) {
      console.error(`[renewal-reminders] Failed for ${member.email}:`, err);
      errorCount++;
    }
  }

  return NextResponse.json({
    message: "Renewal reminder job completed",
    total: unique.length,
    success: successCount,
    errors: errorCount,
  });
}
