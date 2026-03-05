import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { sendEmail, ticketConfirmationEmailHtml } from "@/lib/email/send";
import type Stripe from "stripe";

export const runtime = "nodejs";

type Props = { params: Promise<{ orgSlug: string }> };

export async function POST(req: NextRequest, { params }: Props) {
  const { orgSlug } = await params;
  const service = createServiceClient();

  // Look up org and its Stripe webhook secret
  const { data: org } = await service
    .from("organizations")
    .select("id, name, slug, stripe_secret_key, stripe_webhook_secret")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org?.stripe_secret_key || !org?.stripe_webhook_secret) {
    return NextResponse.json({ error: "Stripe not configured for this org" }, { status: 400 });
  }

  const stripe = getStripe(org.stripe_secret_key);
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, org.stripe_webhook_secret);
  } catch (err) {
    console.error(`[stripe-webhook:${orgSlug}] Signature verification failed:`, err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(stripe, service, event.data.object as Stripe.Checkout.Session, org as { id: string; name: string; slug: string });
        break;
      case "invoice.paid":
        await handleInvoicePaid(service, event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(service, event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(service, event.data.object as Stripe.Subscription);
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook:${orgSlug}] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  service: ReturnType<typeof createServiceClient>,
  session: Stripe.Checkout.Session,
  org: { id: string; name: string; slug: string }
) {
  const { profile_id, plan_id, event_id, ticket_type_id, quantity, buyer_email } = session.metadata ?? {};

  if (session.mode === "subscription" && session.subscription && profile_id && plan_id) {
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    await service.from("membership_subscriptions").upsert({
      org_id: org.id,
      profile_id,
      plan_id,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
    }, { onConflict: "stripe_subscription_id" });

    const periodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000);
    const duesPaidThrough = periodEnd.toISOString().split("T")[0];
    await service.from("profiles").update({ dues_paid_through: duesPaidThrough }).eq("id", profile_id);

  } else if (session.mode === "payment" && event_id && ticket_type_id) {
    const qty = parseInt(quantity ?? "1", 10);
    const email = buyer_email ?? session.customer_details?.email ?? "";
    const amountCents = session.amount_total ?? 0;

    await service.from("event_ticket_orders").upsert({
      org_id: org.id,
      event_id,
      profile_id: profile_id ?? null,
      ticket_type_id,
      quantity: qty,
      amount_cents: amountCents,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string ?? null,
      status: "paid",
      buyer_email: email,
    }, { onConflict: "stripe_session_id" });

    if (profile_id) {
      await service.from("event_rsvps").upsert({
        org_id: org.id,
        event_id,
        profile_id,
        status: "attending",
      }, { onConflict: "event_id,profile_id" });
    }

    // Send ticket confirmation email (non-blocking)
    if (process.env.RESEND_API_KEY && email) {
      try {
        const [{ data: ev }, { data: tt }, { data: profile }] = await Promise.all([
          service.from("events").select("title, start, location, slug").eq("id", event_id).maybeSingle(),
          service.from("event_ticket_types").select("name").eq("id", ticket_type_id).maybeSingle(),
          profile_id
            ? service.from("profiles").select("full_name").eq("id", profile_id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        if (ev && tt) {
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";
          const portalUrl = `https://${org.slug}.${rootDomain}`;
          const eventRow = ev as { title: string; start: string; location: string | null; slug: string };
          const ticketRow = tt as { name: string };
          const profileRow = profile as { full_name: string | null } | null;

          const eventDate = new Date(eventRow.start).toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          });
          const memberName = profileRow?.full_name ?? session.customer_details?.name ?? "Member";

          await sendEmail({
            to: email,
            subject: `Your ticket to ${eventRow.title} is confirmed!`,
            html: ticketConfirmationEmailHtml({
              memberName,
              orgName: org.name,
              eventTitle: eventRow.title,
              eventDate,
              eventLocation: eventRow.location,
              ticketTypeName: ticketRow.name,
              quantity: qty,
              amountCents,
              eventUrl: `${portalUrl}/events/${eventRow.slug}`,
            }),
            fromName: org.name,
          });
        }
      } catch (err) {
        console.error("[stripe-webhook] Failed to send ticket confirmation email:", err);
      }
    }
  }
}

async function handleInvoicePaid(
  service: ReturnType<typeof createServiceClient>,
  invoice: Stripe.Invoice
) {
  const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return;

  const { data: sub } = await service
    .from("membership_subscriptions")
    .select("id, profile_id")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();

  if (!sub) return;

  const periodEnd = (invoice as unknown as { lines: { data: Array<{ period: { end: number } }> } })
    .lines?.data?.[0]?.period?.end;
  if (!periodEnd) return;

  const newPeriodEnd = new Date(periodEnd * 1000).toISOString();
  const duesPaidThrough = newPeriodEnd.split("T")[0];

  await service.from("membership_subscriptions")
    .update({ current_period_end: newPeriodEnd, status: "active" })
    .eq("id", sub.id);

  await service.from("profiles")
    .update({ dues_paid_through: duesPaidThrough })
    .eq("id", sub.profile_id);
}

async function handleSubscriptionUpdated(
  service: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription
) {
  const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString();
  await service.from("membership_subscriptions")
    .update({ status: subscription.status, current_period_end: periodEnd })
    .eq("stripe_subscription_id", subscription.id);
}

async function handleSubscriptionDeleted(
  service: ReturnType<typeof createServiceClient>,
  subscription: Stripe.Subscription
) {
  await service.from("membership_subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscription.id);
}
