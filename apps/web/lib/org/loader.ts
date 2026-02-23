import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import type { OrgConfig } from "@orghub/config";
import { buildOrgConfig } from "@orghub/config";

/**
 * Load org config for the current request.
 * Reads org slug from the x-org-slug header set by middleware,
 * then fetches from the organizations table.
 * Falls back to defaults if not found.
 */
export async function loadOrgConfig(): Promise<OrgConfig> {
  const headersList = await headers();
  const orgSlug = headersList.get("x-org-slug");

  if (!orgSlug) {
    return buildOrgConfig(null);
  }

  try {
    const supabase = await createServiceClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", orgSlug)
      .maybeSingle();

    return buildOrgConfig(org);
  } catch {
    return buildOrgConfig(null);
  }
}

/**
 * Get the current org slug from middleware headers.
 */
export async function getOrgSlug(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-org-slug");
}
