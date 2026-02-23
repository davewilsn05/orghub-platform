import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "orghub.app";

/**
 * Subdomain-based multi-tenant routing.
 *
 * Production:  elks-672.orghub.app/dashboard  → /[orgSlug]/dashboard
 * Custom domain: members.myorg.org/dashboard  → /[orgSlug]/dashboard (via x-org-slug header set by Vercel)
 * Dev:          localhost:3000?org=elks-672    → /[orgSlug]/dashboard
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") ?? "";

  // Static assets and Next internals — pass through unchanged
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
    // Dev: use ?org=slug query param
    orgSlug = url.searchParams.get("org");
  }

  // Production subdomain: elks-672.orghub.app
  if (!orgSlug && hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    orgSlug = hostname.replace(`.${ROOT_DOMAIN}`, "");
  }

  // Custom domain: pass org slug via Vercel edge config header
  if (!orgSlug) {
    orgSlug = request.headers.get("x-org-slug");
  }

  if (!orgSlug || orgSlug === "www") {
    // Root domain — redirect to marketing site
    return NextResponse.redirect(new URL(`https://www.${ROOT_DOMAIN}`));
  }

  // Rewrite path: /dashboard → /[orgSlug]/dashboard
  const originalPath = url.pathname === "/" ? "/dashboard" : url.pathname;
  url.pathname = `/${orgSlug}${originalPath}`;

  // Remove the ?org= param from the rewritten URL
  url.searchParams.delete("org");

  const response = NextResponse.rewrite(url);

  // Pass org slug downstream to server components via header
  response.headers.set("x-org-slug", orgSlug);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
