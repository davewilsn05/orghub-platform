-- ============================================================
-- 008_documents.sql
-- Org document library (bylaws, reports, etc.)
-- ============================================================

CREATE TABLE public.documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title         text NOT NULL,
  category      text,             -- e.g. 'bylaws', 'minutes', 'reports'
  file_url      text NOT NULL,    -- Supabase Storage URL
  file_size     bigint,           -- bytes
  uploaded_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX documents_org_id_idx ON public.documents (org_id);

-- RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- All org members can read documents
CREATE POLICY "documents: org members read"
  ON public.documents FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

-- Admins manage documents
CREATE POLICY "documents: admin full"
  ON public.documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = documents.org_id
        AND p.role IN ('admin', 'board')
    )
  );

COMMENT ON TABLE public.documents IS 'Org document library stored in Supabase Storage.';
