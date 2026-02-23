import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@orghub/db";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

/**
 * Session-aware client for use in Server Components, Route Handlers, and Actions.
 * Reads/writes cookies so the user's session is respected.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — cookies set in middleware instead
          }
        },
      },
    }
  );
}

/**
 * Service-role client for privileged server-side operations (provisioning, admin).
 * Uses @supabase/supabase-js directly — no cookie handling needed.
 * NEVER expose this client or its key to the browser.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
