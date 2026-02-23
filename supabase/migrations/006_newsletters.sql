-- ============================================================
-- 006_newsletters.sql
-- Newsletter drafts, publishing, and send tracking
-- ============================================================

CREATE TYPE public.newsletter_status AS ENUM ('draft', 'published', 'sent');

CREATE TABLE public.newsletters (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title         text NOT NULL,
  slug          text NOT NULL,
  -- Lexical JSON content stored as jsonb
  content       jsonb NOT NULL DEFAULT '{}',
  status        public.newsletter_status NOT NULL DEFAULT 'draft',
  published_at  timestamptz,
  sent_at       timestamptz,
  created_by    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (org_id, slug)
);

CREATE INDEX newsletters_org_id_idx ON public.newsletters (org_id);
CREATE INDEX newsletters_status_idx ON public.newsletters (status);

CREATE TRIGGER newsletters_updated_at
  BEFORE UPDATE ON public.newsletters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Published newsletters readable by all org members
CREATE POLICY "newsletters: org members read published"
  ON public.newsletters FOR SELECT
  USING (
    status = 'published'
    AND org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

-- Admins full access
CREATE POLICY "newsletters: admin full"
  ON public.newsletters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = newsletters.org_id
        AND p.role IN ('admin', 'board')
    )
  );

COMMENT ON TABLE public.newsletters IS
  'Org newsletters with Lexical JSON content. Published = visible to members.';
