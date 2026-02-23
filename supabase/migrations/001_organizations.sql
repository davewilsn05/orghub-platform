-- ============================================================
-- 001_organizations.sql
-- Root tenant table — one row per provisioned organization
-- ============================================================

CREATE TYPE public.org_plan AS ENUM ('free', 'managed', 'network');

CREATE TABLE public.organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,               -- subdomain / URL key
  name            text NOT NULL,
  plan            public.org_plan NOT NULL DEFAULT 'free',

  -- Branding
  primary_color   text,
  secondary_color text,
  logo_url        text,
  favicon_url     text,

  -- Feature flags (platform admin can toggle per org)
  feature_events           boolean NOT NULL DEFAULT true,
  feature_committees       boolean NOT NULL DEFAULT true,
  feature_newsletters      boolean NOT NULL DEFAULT false,
  feature_messaging        boolean NOT NULL DEFAULT false,
  feature_volunteers       boolean NOT NULL DEFAULT false,
  feature_zoom             boolean NOT NULL DEFAULT false,
  feature_documents        boolean NOT NULL DEFAULT false,
  feature_member_directory boolean NOT NULL DEFAULT true,

  -- Hosting
  custom_domain   text UNIQUE,

  -- Billing
  billing_email   text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Platform admins (super-admin) can read all orgs
-- Regular org members never touch this table directly
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — used only by server-side code
-- No policies needed: all access goes through service role or JWT-checked policies below

COMMENT ON TABLE public.organizations IS
  'Root tenant table. Each row represents one provisioned org (lodge, club, chapter).';
