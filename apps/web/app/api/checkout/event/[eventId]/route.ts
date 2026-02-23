import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

type Props = { params: Promise<{ eventId: string }> };

export async function POST(req: NextRequest, { params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const service = createServiceClient();
  const { ticketTypeId, quantity = 1 } = await req.json() as {
    ticketTypeId: string;
    quantity?: number;
  };

  if (!ticketTypeId) return NextResponse.json({ error: "ticketTypeId is required" }, { status: 400 });

  // Load event + org
  const { data: event } = await service
    .from("events")
    .select("id, title, slug, org_id")
    .eq("id", eventId)
    .eq("is_published", true)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Load org Stripe keys
  const { data: org } = await service
    .from("organizations")
    .select("id, slug, stripe_secret_key")
    .eq("id", event.org_id)
    .single();

  if (!org?.stripe_secret_key) {
    return NextResponse.json({ error: "Stripe is not configured for this organization" }, { status: 400 });
  }

  // Load ticket type
  const { data: ticketType } = await service
    .from("event_ticket_types")
    .select("id, name, price_cents, quantity_available, stripe_price_id")
    .eq("id", ticketTypeId)
    .eq("event_id", eventId)
    .eq("is_active", true)
    .single();

  if (!ticketType?.stripe_price_id) {
    return NextResponse.json({ error: "Ticket type not found or not linked to Stripe" }, { status: 400 });
  }

  // Check availability
  if (ticketType.quantity_available !== null) {
    const { count } = await service
      .from("event_ticket_orders")
      .select("id", { count: "exact", head: true })
      .eq("ticket_type_id", ticketTypeId)
      .eq("status", "paid");

    const sold = count ?? 0;
    if (sold + quantity > ticketType.quantity_available) {
      return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 });
    }
  }

  const stripe = getStripe(org.stripe_secret_key);
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";
  const portalUrl = process.env.NODE_ENV === "development"
    ? `http://localhost:3000`
    : `https://${org.slug}.${rootDomain}`;

  const buyerEmail = user?.email ?? undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: ticketType.stripe_price_id, quantity }],
    success_url: `${portalUrl}/events/${event.slug}?ticket_success=1`,
    cancel_url: `${portalUrl}/events/${event.slug}`,
    customer_email: buyerEmail,
    metadata: {
      event_id: event.id,
      ticket_type_id: ticketType.id,
      quantity: String(quantity),
      profile_id: user?.id ?? "",
      buyer_email: buyerEmail ?? "",
      org_id: org.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
