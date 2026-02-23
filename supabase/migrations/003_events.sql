-- ============================================================
-- 003_events.sql
-- Events + RSVPs, scoped per org
-- ============================================================

CREATE TABLE public.events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title           text NOT NULL,
  slug            text NOT NULL,
  description     text,
  location        text,
  start           timestamptz NOT NULL,
  "end"           timestamptz,
  all_day         boolean NOT NULL DEFAULT false,
  category        text,
  image_url       text,
  is_published    boolean NOT NULL DEFAULT false,
  rsvp_enabled    boolean NOT NULL DEFAULT false,
  rsvp_limit      integer,

  -- Zoom
  is_zoom_meeting boolean NOT NULL DEFAULT false,
  zoom_url        text,
  zoom_meeting_id text,
  zoom_passcode   text,

  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (org_id, slug)
);

CREATE INDEX events_org_id_idx   ON public.events (org_id);
CREATE INDEX events_start_idx    ON public.events (start);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RSVPs
CREATE TYPE public.rsvp_status AS ENUM ('attending', 'not_attending', 'maybe');

CREATE TABLE public.event_rsvps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id    uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      public.rsvp_status NOT NULL DEFAULT 'attending',
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (event_id, profile_id)
);

CREATE INDEX event_rsvps_event_id_idx ON public.event_rsvps (event_id);
CREATE INDEX event_rsvps_org_id_idx   ON public.event_rsvps (org_id);

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Published events readable by org members
CREATE POLICY "events: org members read published"
  ON public.events FOR SELECT
  USING (
    is_published = true
    AND org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

-- Admins / board read all (including drafts)
CREATE POLICY "events: admin read all"
  ON public.events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = events.org_id
        AND p.role IN ('admin', 'board')
    )
  );

-- Admins can manage events
CREATE POLICY "events: admin manage"
  ON public.events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = events.org_id
        AND p.role IN ('admin', 'board')
    )
  );

-- RSVPs: members read their own org's
CREATE POLICY "rsvps: org members read"
  ON public.event_rsvps FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

-- RSVPs: members manage their own
CREATE POLICY "rsvps: own rsvp manage"
  ON public.event_rsvps FOR ALL
  USING (profile_id = auth.uid());

COMMENT ON TABLE public.events IS 'Org events with optional RSVP and Zoom support.';
COMMENT ON TABLE public.event_rsvps IS 'Member RSVPs for events.';
