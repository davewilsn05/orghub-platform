import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // CSRF origin check
  const reqOrigin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (reqOrigin && host) {
    const originHost = new URL(reqOrigin).host;
    if (originHost !== host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
