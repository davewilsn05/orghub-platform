import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieLike = { name: string; value: string; options?: Record<string, unknown> };

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";

/** Paths that don't require authentication */
const PUBLIC_PATHS = new Set(["/login", "/auth/callback", "/auth/signout", "/join"]);

/**
 * Top-level paths that bypass org-slug routing entirely.
 * These are platform-level pages (registration, marketing redirects).
 */
const PLATFORM_PATHS = new Set(["/register"]);

/**
 * Subdomain-based multi-tenant routing + auth protection.
 *
 * Production:  elks-672.orghub.app/dashboard  → /[orgSlug]/dashboard
 * Dev:          localhost:3000?org=elks-672    → /[orgSlug]/dashboard
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") ?? "";

  // Static assets and Next internals — pass through
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // --- Resolve org slug ---
  let orgSlug: string | null = null;

  if (process.env.NODE_ENV === "development") {
    orgSlug = url.searchParams.get("org");
  }

  if (!orgSlug && hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    orgSlug = hostname.replace(`.${ROOT_DOMAIN}`, "");
  }

  if (!orgSlug) {
    orgSlug = request.headers.get("x-org-slug");
  }

  // Platform-level paths (e.g. /register) work without an org slug
  if (PLATFORM_PATHS.has(url.pathname)) {
    return NextResponse.next();
  }

  if (!orgSlug || orgSlug === "www") {
    // In dev, redirect to /register so localhost:3000 is useful without ?org=
    if (process.env.NODE_ENV === "development") {
      return NextResponse.redirect(new URL("/register", request.url));
    }
    return NextResponse.redirect(new URL(`https://www.${ROOT_DOMAIN}`));
  }

  // --- Auth check (skip for public paths) ---
  const isPublicPath = PUBLIC_PATHS.has(url.pathname);

  // Set up a mutable response for Supabase to write session cookies into
  let response = NextResponse.next({ request });

  if (!isPublicPath) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: CookieLike[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              response.cookies.set(name, value, options as any)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login, preserving org context
      const loginUrl = new URL(request.url);
      loginUrl.pathname = "/login";
      if (process.env.NODE_ENV === "development") {
        loginUrl.searchParams.set("org", orgSlug);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Rewrite path to [orgSlug]/... ---
  const originalPath = url.pathname === "/" ? "/dashboard" : url.pathname;
  url.pathname = `/${orgSlug}${originalPath}`;
  url.searchParams.delete("org");

  const rewriteResponse = NextResponse.rewrite(url, { request });

  // Copy any session cookies the Supabase client set
  response.cookies.getAll().forEach(({ name, value, ...options }) => {
    rewriteResponse.cookies.set(name, value, options);
  });

  rewriteResponse.headers.set("x-org-slug", orgSlug);

  return rewriteResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
