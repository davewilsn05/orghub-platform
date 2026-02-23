import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const service = createServiceClient();
  const { data: plans, error } = await service
    .from("membership_plans")
    .select("*")
    .eq("org_id", orgId)
    .order("price_cents", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: plans ?? [] });
}

export async function POST(req: NextRequest) {
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
    name: string;
    description?: string;
    price_cents: number;
    interval: string;
    stripe_price_id?: string;
  };

  if (!body.name || !body.price_cents || !body.interval) {
    return NextResponse.json({ error: "name, price_cents, and interval are required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("membership_plans")
    .insert({
      org_id: orgId,
      name: body.name,
      description: body.description ?? null,
      price_cents: body.price_cents,
      interval: body.interval,
      stripe_price_id: body.stripe_price_id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data }, { status: 201 });
}
