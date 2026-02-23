-- ============================================================
-- 009_jwt_hook.sql
-- Custom JWT access token hook — embeds org_id into every JWT
-- so RLS policies can reference auth.jwt() -> 'org_id'
--
-- Configure in Supabase Dashboard:
--   Auth → Hooks → Custom Access Token Hook
--   Schema: public, Function: custom_access_token_hook
-- ============================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims   jsonb;
  user_org uuid;
  user_role text;
BEGIN
  claims := event -> 'claims';

  -- Look up this user's org and role
  SELECT p.org_id, p.role::text
    INTO user_org, user_role
    FROM public.profiles p
   WHERE p.id = (event ->> 'user_id')::uuid
   LIMIT 1;

  IF user_org IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}', to_jsonb(user_org::text));
    claims := jsonb_set(claims, '{org_role}', to_jsonb(user_role));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant the hook function execute permission to Supabase auth
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

COMMENT ON FUNCTION public.custom_access_token_hook IS
  'Embeds org_id and org_role into every JWT. Register as Custom Access Token Hook in Supabase Dashboard.';

-- ============================================================
-- CONVENIENCE HELPERS
-- These helper functions make RLS policies cleaner.
-- ============================================================

-- Get current user's org_id from JWT
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() ->> 'org_id')::uuid;
$$;

-- Get current user's role from JWT
CREATE OR REPLACE FUNCTION public.current_org_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() ->> 'org_role';
$$;

-- Check if current user is admin or board
CREATE OR REPLACE FUNCTION public.is_admin_or_board()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() ->> 'org_role') IN ('admin', 'board');
$$;

COMMENT ON FUNCTION public.current_org_id IS 'Returns the org_id from the JWT claim set by the custom hook.';
COMMENT ON FUNCTION public.current_org_role IS 'Returns the org_role from the JWT claim.';
COMMENT ON FUNCTION public.is_admin_or_board IS 'True if the current user has admin or board role.';
