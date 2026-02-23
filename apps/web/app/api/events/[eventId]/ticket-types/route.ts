import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ eventId: string }> };

export async function GET(_req: NextRequest, { params }: Props) {
  const { eventId } = await params;
  const service = createServiceClient();

  const { data: types, error } = await service
    .from("event_ticket_types")
    .select("id, name, price_cents, quantity_available, stripe_price_id")
    .eq("event_id", eventId)
    .eq("is_active", true)
    .order("price_cents", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ types: types ?? [] });
}

export async function POST(req: NextRequest, { params }: Props) {
  const { eventId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgRole = user.app_metadata?.org_role as string | undefined;
  if (!orgRole || !["admin", "board"].includes(orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const body = await req.json() as {
    name?: string;
    price_cents: number;
    quantity_available?: number | null;
    stripe_price_id?: string;
  };

  const service = createServiceClient();
  const { data, error } = await service
    .from("event_ticket_types")
    .insert({
      org_id: orgId,
      event_id: eventId,
      name: body.name ?? "General Admission",
      price_cents: body.price_cents,
      quantity_available: body.quantity_available ?? null,
      stripe_price_id: body.stripe_price_id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ type: data }, { status: 201 });
}
