-- ============================================================
-- 005_messaging.sql
-- Internal messaging system (inbox, sent, bulletins)
-- ============================================================

CREATE TYPE public.message_audience AS ENUM ('all', 'board', 'committee', 'individual');

CREATE TABLE public.messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subject       text NOT NULL,
  body          text NOT NULL,
  sender_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  audience      public.message_audience NOT NULL DEFAULT 'individual',
  -- When audience = 'committee', this is committee_id
  -- When audience = 'individual', this is profile_id
  audience_ref  uuid,
  sent_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_org_id_idx    ON public.messages (org_id);
CREATE INDEX messages_sender_id_idx ON public.messages (sender_id);

CREATE TABLE public.message_recipients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  message_id  uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read     boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  read_at     timestamptz,

  UNIQUE (message_id, profile_id)
);

CREATE INDEX message_recipients_profile_id_idx ON public.message_recipients (profile_id);
CREATE INDEX message_recipients_org_id_idx     ON public.message_recipients (org_id);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_recipients ENABLE ROW LEVEL SECURITY;

-- Senders can see their own messages
CREATE POLICY "messages: sender read own"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid());

-- Admins can read all in their org
CREATE POLICY "messages: admin read all"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = messages.org_id
        AND p.role IN ('admin', 'board')
    )
  );

-- Any org member can create a message
CREATE POLICY "messages: org members create"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

-- Recipients see their own deliveries
CREATE POLICY "message_recipients: own"
  ON public.message_recipients FOR ALL
  USING (profile_id = auth.uid());

-- Admins see all in their org
CREATE POLICY "message_recipients: admin read"
  ON public.message_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = message_recipients.org_id
        AND p.role IN ('admin', 'board')
    )
  );

COMMENT ON TABLE public.messages IS 'Internal messages between org members.';
COMMENT ON TABLE public.message_recipients IS 'Fan-out delivery table for messages.';
