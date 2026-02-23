import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const service = createServiceClient();

  const { data: org } = await service
    .from("organizations")
    .select("slug, stripe_secret_key")
    .eq("id", orgId)
    .single();

  if (!org?.stripe_secret_key) {
    return NextResponse.json({ error: "Stripe is not configured for this organization" }, { status: 400 });
  }

  const { data: sub } = await service
    .from("membership_subscriptions")
    .select("stripe_customer_id")
    .eq("profile_id", user.id)
    .eq("org_id", orgId)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing record found" }, { status: 404 });
  }

  const stripe = getStripe(org.stripe_secret_key);
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";
  const portalUrl = process.env.NODE_ENV === "development"
    ? `http://localhost:3000`
    : `https://${org.slug}.${rootDomain}`;

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${portalUrl}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
