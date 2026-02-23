-- ============================================================
-- 007_volunteers.sql
-- Volunteer slots and member signups
-- ============================================================

CREATE TABLE public.volunteer_slots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id      uuid REFERENCES public.events(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  date          date,
  spots_total   integer NOT NULL DEFAULT 1 CHECK (spots_total > 0),
  spots_filled  integer NOT NULL DEFAULT 0 CHECK (spots_filled >= 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX volunteer_slots_org_id_idx   ON public.volunteer_slots (org_id);
CREATE INDEX volunteer_slots_event_id_idx ON public.volunteer_slots (event_id);

CREATE TABLE public.volunteer_signups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  slot_id       uuid NOT NULL REFERENCES public.volunteer_slots(id) ON DELETE CASCADE,
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signed_up_at  timestamptz NOT NULL DEFAULT now(),
  checked_in_at timestamptz,

  UNIQUE (slot_id, profile_id)
);

CREATE INDEX volunteer_signups_slot_id_idx    ON public.volunteer_signups (slot_id);
CREATE INDEX volunteer_signups_profile_id_idx ON public.volunteer_signups (profile_id);

-- Auto-update spots_filled when signups change
CREATE OR REPLACE FUNCTION public.update_volunteer_spots()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.volunteer_slots
    SET spots_filled = spots_filled + 1
    WHERE id = NEW.slot_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.volunteer_slots
    SET spots_filled = GREATEST(0, spots_filled - 1)
    WHERE id = OLD.slot_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER volunteer_signups_update_spots
  AFTER INSERT OR DELETE ON public.volunteer_signups
  FOR EACH ROW EXECUTE FUNCTION public.update_volunteer_spots();

-- RLS
ALTER TABLE public.volunteer_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "volunteer_slots: org members read"
  ON public.volunteer_slots FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "volunteer_slots: admin full"
  ON public.volunteer_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.org_id = volunteer_slots.org_id
        AND p.role IN ('admin', 'board')
    )
  );

CREATE POLICY "volunteer_signups: org members read"
  ON public.volunteer_signups FOR SELECT
  USING (
    org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "volunteer_signups: own manage"
  ON public.volunteer_signups FOR ALL
  USING (profile_id = auth.uid());

COMMENT ON TABLE public.volunteer_slots IS 'Volunteer opportunities with capacity tracking.';
COMMENT ON TABLE public.volunteer_signups IS 'Member sign-ups for volunteer slots.';
