/**
 * The canonical shape of an organization row from the `organizations` table.
 * Mirrors the DB columns — nullable fields are optional here.
 */
export interface OrgRow {
  id: string;
  slug: string;
  name: string;
  plan: "free" | "managed" | "network";
  // Branding
  primary_color?: string | null;
  secondary_color?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  // Feature flags (all optional — default false)
  feature_events?: boolean | null;
  feature_committees?: boolean | null;
  feature_newsletters?: boolean | null;
  feature_messaging?: boolean | null;
  feature_volunteers?: boolean | null;
  feature_zoom?: boolean | null;
  feature_documents?: boolean | null;
  feature_member_directory?: boolean | null;
  // Custom domain
  custom_domain?: string | null;
  // Metadata
  created_at?: string | null;
}

/**
 * Resolved org config used throughout the app.
 * All fields have sensible defaults — never undefined.
 */
export interface OrgConfig {
  id: string;
  slug: string;
  name: string;
  plan: "free" | "managed" | "network";
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string | null;
    faviconUrl: string | null;
  };
  features: {
    events: boolean;
    committees: boolean;
    newsletters: boolean;
    messaging: boolean;
    volunteers: boolean;
    zoom: boolean;
    documents: boolean;
    memberDirectory: boolean;
  };
  customDomain: string | null;
}

/** Default branding applied when org has no custom colors set. */
export const DEFAULT_BRANDING = {
  primaryColor: "#3b82f6",
  secondaryColor: "#2ea043",
  logoUrl: null,
  faviconUrl: null,
} as const;

/** Default features — everything on for managed plans, restricted for free. */
export const DEFAULT_FEATURES = {
  events: true,
  committees: true,
  newsletters: false,
  messaging: false,
  volunteers: false,
  zoom: false,
  documents: false,
  memberDirectory: true,
} as const;

/** Fallback org used when no tenant is matched (dev/preview). */
export const FALLBACK_ORG: OrgConfig = {
  id: "00000000-0000-0000-0000-000000000000",
  slug: "demo",
  name: "Demo Organization",
  plan: "free",
  branding: { ...DEFAULT_BRANDING },
  features: { ...DEFAULT_FEATURES },
  customDomain: null,
};
