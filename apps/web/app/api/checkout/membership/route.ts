import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const { planId } = await req.json() as { planId: string };
  if (!planId) return NextResponse.json({ error: "planId is required" }, { status: 400 });

  const service = createServiceClient();

  // Load org Stripe keys
  const { data: org } = await service
    .from("organizations")
    .select("id, slug, stripe_secret_key")
    .eq("id", orgId)
    .single();

  if (!org?.stripe_secret_key) {
    return NextResponse.json({ error: "Stripe is not configured for this organization" }, { status: 400 });
  }

  // Load plan (must belong to this org)
  const { data: plan } = await service
    .from("membership_plans")
    .select("id, name, stripe_price_id")
    .eq("id", planId)
    .eq("org_id", orgId)
    .eq("is_active", true)
    .single();

  if (!plan?.stripe_price_id) {
    return NextResponse.json({ error: "Plan not found or not linked to Stripe" }, { status: 400 });
  }

  const stripe = getStripe(org.stripe_secret_key);
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";
  const portalUrl = process.env.NODE_ENV === "development"
    ? `http://localhost:3000`
    : `https://${org.slug}.${rootDomain}`;

  // Find or create Stripe customer
  const { data: existingSub } = await service
    .from("membership_subscriptions")
    .select("stripe_customer_id")
    .eq("profile_id", user.id)
    .eq("org_id", orgId)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let customerId: string;
  if (existingSub?.stripe_customer_id) {
    customerId = existingSub.stripe_customer_id;
  } else {
    const { data: profile } = await service
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      name: profile?.full_name ?? undefined,
      metadata: { profile_id: user.id, org_id: orgId },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    success_url: `${portalUrl}/membership?success=1`,
    cancel_url: `${portalUrl}/membership?canceled=1`,
    metadata: {
      profile_id: user.id,
      plan_id: plan.id,
      org_id: orgId,
    },
  });

  return NextResponse.json({ url: session.url });
}
