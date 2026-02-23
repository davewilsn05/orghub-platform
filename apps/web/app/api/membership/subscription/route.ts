import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const service = createServiceClient();
  const { data: sub } = await service
    .from("membership_subscriptions")
    .select("id, status, current_period_end, stripe_customer_id, plan_id, membership_plans(name, price_cents, interval)")
    .eq("profile_id", user.id)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: profile } = await service
    .from("profiles")
    .select("dues_paid_through")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ subscription: sub, dues_paid_through: profile?.dues_paid_through ?? null });
}
