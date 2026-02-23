-- ============================================================
-- 011_invites.sql
-- Org member invites with expiring tokens
-- ============================================================

CREATE TABLE public.invites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        public.user_role NOT NULL DEFAULT 'member',
  token       text NOT NULL UNIQUE,
  invited_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invites_org_id_idx ON public.invites (org_id);
CREATE INDEX invites_token_idx  ON public.invites (token);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Admins can manage invites for their org
CREATE POLICY "invites: admin full access"
  ON public.invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = invites.org_id
        AND p.role IN ('admin', 'board')
    )
  );

COMMENT ON TABLE public.invites IS 'Email invites for org members. Token is shared via email or link.';
