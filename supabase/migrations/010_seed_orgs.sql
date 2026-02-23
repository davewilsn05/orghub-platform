-- ============================================================
-- 010_seed_orgs.sql
-- Seed the two founding tenants:
--   1. Pasadena Elks Lodge #672
--   2. Garibaldina Italian American Society
--
-- These are dev/staging seeds only. Production data goes through
-- the provisioning API (POST /api/platform/orgs).
-- ============================================================

INSERT INTO public.organizations (
  id,
  slug,
  name,
  plan,
  primary_color,
  secondary_color,
  feature_events,
  feature_committees,
  feature_newsletters,
  feature_messaging,
  feature_volunteers,
  feature_zoom,
  feature_documents,
  feature_member_directory
) VALUES
(
  '11111111-0001-0001-0001-000000000001',
  'elks-672',
  'Pasadena Elks Lodge #672',
  'managed',
  '#1e40af',    -- Elks blue
  '#b91c1c',    -- Elks red
  true, true, true, true, true, true, true, true
),
(
  '22222222-0002-0002-0002-000000000002',
  'garibaldina',
  'Garibaldina Italian American Society',
  'managed',
  '#b91c1c',    -- Italian red
  '#15803d',    -- Italian green
  true, true, true, true, true, true, true, true
)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE public.organizations IS
  'Seeded with elks-672 and garibaldina as founding tenants.';
