export type { OrgRow, OrgConfig } from "./schema";
export {
  DEFAULT_BRANDING,
  DEFAULT_FEATURES,
  FALLBACK_ORG,
} from "./schema";

import type { OrgRow, OrgConfig } from "./schema";
import {
  DEFAULT_BRANDING,
  DEFAULT_FEATURES,
  FALLBACK_ORG,
} from "./schema";

/**
 * Build a fully-resolved OrgConfig from a raw DB row.
 * Pass `null` to get the fallback/demo config.
 */
export function buildOrgConfig(org: OrgRow | null): OrgConfig {
  if (!org) return FALLBACK_ORG;

  return {
    id: org.id,
    slug: org.slug,
    name: org.name,
    plan: org.plan ?? "free",
    branding: {
      primaryColor: org.primary_color ?? DEFAULT_BRANDING.primaryColor,
      secondaryColor: org.secondary_color ?? DEFAULT_BRANDING.secondaryColor,
      logoUrl: org.logo_url ?? null,
      faviconUrl: org.favicon_url ?? null,
    },
    features: {
      events: org.feature_events ?? DEFAULT_FEATURES.events,
      committees: org.feature_committees ?? DEFAULT_FEATURES.committees,
      newsletters: org.feature_newsletters ?? DEFAULT_FEATURES.newsletters,
      messaging: org.feature_messaging ?? DEFAULT_FEATURES.messaging,
      volunteers: org.feature_volunteers ?? DEFAULT_FEATURES.volunteers,
      zoom: org.feature_zoom ?? DEFAULT_FEATURES.zoom,
      documents: org.feature_documents ?? DEFAULT_FEATURES.documents,
      memberDirectory:
        org.feature_member_directory ?? DEFAULT_FEATURES.memberDirectory,
    },
    customDomain: org.custom_domain ?? null,
  };
}

/**
 * Generate CSS custom properties string for org branding.
 * Inject into <style> tag in the document <head>.
 *
 * @example
 * <style dangerouslySetInnerHTML={{ __html: buildOrgCssVars(org) }} />
 */
export function buildOrgCssVars(org: OrgConfig): string {
  return `
:root {
  --org-primary: ${org.branding.primaryColor};
  --org-secondary: ${org.branding.secondaryColor};
}
`.trim();
}
