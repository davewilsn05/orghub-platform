-- ============================================================
-- 004_committees.sql
-- Committees (or councils, boards — org-agnostic name)
-- ============================================================

CREATE TABLE public.committees (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name              text NOT NULL,
  slug              text NOT NULL,
  description       text,
  chair_profile_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  UNIQUE (org_id, slug)
);

CREATE INDEX committees_org_id_idx ON public.committees (org_id);

CREATE TRIGGER committees_updated_at
  BEFORE UPDATE ON public.committees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Committee memberships
CREATE TABLE public.committee_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  committee_id  uuid NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'member' CHECK (role IN ('chair', 'member')),
  joined_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (committee_id, profile_id)
);

CREATE INDEX committee_members_committee_id_idx ON public.committee_members (committee_id);
CREATE INDEX committee_members_profile_id_idx   ON public.committee_members (profile_id);

-- RLS
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "committees: org members read active"
  ON public.committees FOR SELECT
  USING (
    is_active = true
    AND org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "committees: admin full"
  ON public.committees FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = committees.org_id
        AND p.role IN ('admin', 'board')
    )
  );

CREATE POLICY "committee_members: org members read"
  ON public.committee_members FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "committee_members: admin full"
  ON public.committee_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = committee_members.org_id
        AND p.role IN ('admin', 'board')
    )
  );

COMMENT ON TABLE public.committees IS
  'Org committees / councils / boards. org-agnostic naming — each org calls them what they want.';
