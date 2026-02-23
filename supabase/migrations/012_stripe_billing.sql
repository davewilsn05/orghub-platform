-- ============================================================
-- 012_stripe_billing.sql
-- Stripe billing: membership dues + event ticket sales
-- ============================================================

-- Per-org Stripe credentials (admin pastes their own Stripe keys)
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS stripe_publishable_key text,
  ADD COLUMN IF NOT EXISTS stripe_secret_key       text,
  ADD COLUMN IF NOT EXISTS stripe_webhook_secret   text;

-- Dues expiry on profiles (updated by webhook on each invoice.paid)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dues_paid_through date;

-- ============================================================
-- MEMBERSHIP PLANS
-- Admin creates plans and links them to a Stripe Price ID
-- ============================================================
CREATE TABLE public.membership_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text,
  price_cents      integer NOT NULL,
  interval         text NOT NULL CHECK (interval IN ('month','year')),
  stripe_price_id  text,
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX membership_plans_org_id_idx ON public.membership_plans (org_id);

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "membership_plans: org members read active"
  ON public.membership_plans FOR SELECT
  USING (is_active = true AND org_id = public.current_org_id());

CREATE POLICY "membership_plans: admin manage"
  ON public.membership_plans FOR ALL
  USING (org_id = public.current_org_id() AND public.is_admin_or_board());

-- ============================================================
-- MEMBERSHIP SUBSCRIPTIONS
-- One row per member's active Stripe subscription
-- ============================================================
CREATE TABLE public.membership_subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id              uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id                 uuid REFERENCES public.membership_plans(id),
  stripe_customer_id      text,
  stripe_subscription_id  text UNIQUE,
  status                  text NOT NULL DEFAULT 'pending',
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX membership_subscriptions_org_id_idx     ON public.membership_subscriptions (org_id);
CREATE INDEX membership_subscriptions_profile_id_idx ON public.membership_subscriptions (profile_id);

CREATE TRIGGER membership_subscriptions_updated_at
  BEFORE UPDATE ON public.membership_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.membership_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "membership_subscriptions: own read"
  ON public.membership_subscriptions FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "membership_subscriptions: admin read"
  ON public.membership_subscriptions FOR SELECT
  USING (org_id = public.current_org_id() AND public.is_admin_or_board());

-- ============================================================
-- EVENT TICKET TYPES
-- Admin creates ticket tiers per event and links Stripe Price ID
-- ============================================================
CREATE TABLE public.event_ticket_types (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id            uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name                text NOT NULL DEFAULT 'General Admission',
  price_cents         integer NOT NULL,
  quantity_available  integer,
  stripe_price_id     text,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX event_ticket_types_event_id_idx ON public.event_ticket_types (event_id);
CREATE INDEX event_ticket_types_org_id_idx   ON public.event_ticket_types (org_id);

ALTER TABLE public.event_ticket_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_ticket_types: org members read active"
  ON public.event_ticket_types FOR SELECT
  USING (is_active = true AND org_id = public.current_org_id());

CREATE POLICY "event_ticket_types: admin manage"
  ON public.event_ticket_types FOR ALL
  USING (org_id = public.current_org_id() AND public.is_admin_or_board());

-- ============================================================
-- EVENT TICKET ORDERS
-- One row per ticket purchase (Stripe Checkout session)
-- ============================================================
CREATE TABLE public.event_ticket_orders (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                   uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id                 uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id               uuid REFERENCES public.profiles(id),
  ticket_type_id           uuid REFERENCES public.event_ticket_types(id),
  quantity                 integer NOT NULL DEFAULT 1,
  amount_cents             integer NOT NULL,
  stripe_session_id        text UNIQUE,
  stripe_payment_intent_id text,
  status                   text NOT NULL DEFAULT 'pending',
  buyer_email              text NOT NULL,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX event_ticket_orders_event_id_idx   ON public.event_ticket_orders (event_id);
CREATE INDEX event_ticket_orders_org_id_idx     ON public.event_ticket_orders (org_id);
CREATE INDEX event_ticket_orders_profile_id_idx ON public.event_ticket_orders (profile_id);

ALTER TABLE public.event_ticket_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_ticket_orders: own read"
  ON public.event_ticket_orders FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "event_ticket_orders: admin read"
  ON public.event_ticket_orders FOR SELECT
  USING (org_id = public.current_org_id() AND public.is_admin_or_board());

COMMENT ON TABLE public.membership_plans         IS 'Membership plans with optional Stripe Price ID for recurring billing.';
COMMENT ON TABLE public.membership_subscriptions IS 'Active Stripe subscriptions per org member.';
COMMENT ON TABLE public.event_ticket_types       IS 'Ticket tiers per event with optional Stripe Price ID.';
COMMENT ON TABLE public.event_ticket_orders      IS 'One row per completed Stripe ticket purchase.';
