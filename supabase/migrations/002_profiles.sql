-- ============================================================
-- 002_profiles.sql
-- Member profiles — one per auth.users row, scoped to an org
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('member', 'committee_chair', 'board', 'admin');

CREATE TABLE public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email           text NOT NULL,
  full_name       text,
  role            public.user_role NOT NULL DEFAULT 'member',
  phone           text,
  avatar_url      text,
  is_active       boolean NOT NULL DEFAULT true,
  joined_at       date,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_org_id_idx ON public.profiles (org_id);
CREATE UNIQUE INDEX profiles_org_email_idx ON public.profiles (org_id, email);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Members can read other profiles in the same org
CREATE POLICY "profiles: org members can read"
  ON public.profiles FOR SELECT
  USING (
    org_id = (
      SELECT org_id FROM public.profiles
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

-- Members can update their own profile
CREATE POLICY "profiles: own profile update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins can do anything within their org
CREATE POLICY "profiles: admin full access"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = profiles.org_id
        AND p.role = 'admin'
    )
  );

COMMENT ON TABLE public.profiles IS
  'Per-org member profiles. Extends auth.users with role and org membership.';
