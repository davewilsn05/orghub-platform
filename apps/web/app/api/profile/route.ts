import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("id, full_name, email, role, joined_at, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { full_name?: string };

  if (typeof body.full_name !== "string" || !body.full_name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const fullName = body.full_name.trim();
  const service = createServiceClient();

  const { error } = await service
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Keep auth metadata in sync
  await service.auth.admin.updateUserById(user.id, {
    user_metadata: { full_name: fullName },
  });

  return NextResponse.json({ ok: true });
}
