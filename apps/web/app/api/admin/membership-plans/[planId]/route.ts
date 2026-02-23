import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ planId: string }> };

export async function PATCH(req: NextRequest, { params }: Props) {
  const { planId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgRole = user.app_metadata?.org_role as string | undefined;
  if (!orgRole || !["admin", "board"].includes(orgRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgId = user.app_metadata?.org_id as string | undefined;
  if (!orgId) return NextResponse.json({ error: "No org context" }, { status: 400 });

  const body = await req.json() as Partial<{
    name: string;
    description: string | null;
    price_cents: number;
    interval: string;
    stripe_price_id: string | null;
    is_active: boolean;
  }>;

  const service = createServiceClient();
  const { data, error } = await service
    .from("membership_plans")
    .update(body)
    .eq("id", planId)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data });
}
