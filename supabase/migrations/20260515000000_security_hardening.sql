-- Security Hardening Migration
-- This migration addresses several security warnings related to RLS policies and functions

-- 1. Restrict INSERT on user_purchases and founding33_purchases to service_role only
-- This prevents users from self-inserting records to bypass paywalls

DROP POLICY IF EXISTS "Only backend can create purchases" ON public.user_purchases;
DROP POLICY IF EXISTS "System can create purchases" ON public.user_purchases;
CREATE POLICY "Service role can insert user purchases"
ON public.user_purchases
FOR INSERT
TO service_role
WITH CHECK (true);

-- founding33_purchases hardening
DROP POLICY IF EXISTS "Service role can insert founding33 purchases" ON public.founding33_purchases;
CREATE POLICY "Service role can insert founding33 purchases"
ON public.founding33_purchases
FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update founding33 purchases" ON public.founding33_purchases;
CREATE POLICY "Service role can update founding33 purchases"
ON public.founding33_purchases
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure authenticated users can only view their own purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.user_purchases;
CREATE POLICY "Users can view their own purchases"
ON public.user_purchases
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Harden user_points - remove direct manipulation by users
-- Points should only be managed via award_user_points function
DROP POLICY IF EXISTS "Authenticated users can award points" ON public.user_points;
DROP POLICY IF EXISTS "Service role can manage points" ON public.user_points;
DROP POLICY IF EXISTS "Service role can insert points" ON public.user_points;
CREATE POLICY "Service role can manage points"
ON public.user_points
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix "Always True" policies and unauthenticated access
-- wallet_addresses: Ensure users can only see their own
DROP POLICY IF EXISTS "Anyone can view wallet addresses" ON public.wallet_addresses;
DROP POLICY IF EXISTS "Users can view their own wallet addresses" ON public.wallet_addresses;
CREATE POLICY "Users can view their own wallet addresses"
ON public.wallet_addresses
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- raffle_tasks: Ensure users can only update their own tasks
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.raffle_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks safely" ON public.raffle_tasks;
CREATE POLICY "Users can update their own tasks"
ON public.raffle_tasks
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Secure SECURITY DEFINER functions with search_path = public
-- And revoke public execute permissions for sensitive functions

-- award_user_points
CREATE OR REPLACE FUNCTION public.award_user_points(
  _user_id UUID,
  _points INTEGER,
  _action_type TEXT,
  _action_id TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_month_year TEXT;
BEGIN
    -- Security check: only allow user to award points to themselves, or service role
    IF (auth.uid() <> _user_id AND auth.role() <> 'service_role') THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;

    v_month_year := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM');

    INSERT INTO public.user_points (user_id, points, action_type, action_id, month_year, metadata)
    VALUES (_user_id, _points, _action_type, _action_id, v_month_year, _metadata)
    ON CONFLICT (user_id, action_type, action_id, month_year) DO NOTHING;

    RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.award_user_points(UUID, INTEGER, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_user_points(UUID, INTEGER, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_user_points(UUID, INTEGER, TEXT, TEXT, JSONB) TO authenticated;

-- get_founding33_spots_remaining
CREATE OR REPLACE FUNCTION public.get_founding33_spots_remaining()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN GREATEST(0, 33 - (
    SELECT COUNT(*)::INTEGER
    FROM public.founding33_purchases
    WHERE status = 'completed'
  ));
END;
$$;

-- handle_new_user (Trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

-- check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_requests INTEGER,
  p_interval_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND last_request < NOW() - (p_interval_seconds || ' seconds')::INTERVAL;

  SELECT count INTO v_count
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;

  IF v_count IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, count, last_request)
    VALUES (p_identifier, p_action, 1, NOW());
    RETURN TRUE;
  ELSIF v_count < p_max_requests THEN
    UPDATE public.rate_limits
    SET count = count + 1, last_request = NOW()
    WHERE identifier = p_identifier AND action = p_action;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- get_user_emails_with_profiles
CREATE OR REPLACE FUNCTION public.get_user_emails_with_profiles()
RETURNS TABLE (user_id UUID, email TEXT, display_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check: only allow admins or service role to see all emails
  IF NOT (public.has_role(auth.uid(), 'admin') OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT p.user_id, u.email::TEXT, p.display_name
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_emails_with_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_emails_with_profiles() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_emails_with_profiles() TO authenticated;

-- user_has_purchased_product
CREATE OR REPLACE FUNCTION public.user_has_purchased_product(product_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_purchases
    WHERE user_id = auth.uid() AND user_purchases.product_id = $1
  );
END;
$$;

-- user_has_founding33_access
CREATE OR REPLACE FUNCTION public.user_has_founding33_access(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.founding33_purchases
    WHERE user_id = check_user_id AND status = 'completed'
  );
END;
$$;

-- 5. Restrict sensitive fields in discount_codes
-- Create a view for public consumption that excludes internal fields
DROP VIEW IF EXISTS public.active_discounts;
CREATE VIEW public.active_discounts AS
SELECT id, code, discount_type, discount_value, min_purchase_amount, valid_from, valid_until
FROM public.discount_codes
WHERE is_active = true
  AND (valid_from IS NULL OR valid_from <= now())
  AND (valid_until IS NULL OR valid_until > now())
  AND (max_uses IS NULL OR current_uses < max_uses);

GRANT SELECT ON public.active_discounts TO authenticated;
GRANT SELECT ON public.active_discounts TO anon;

-- Revoke direct SELECT on discount_codes from authenticated/anon to protect internal fields
-- Only admins and service_role should see everything
REVOKE SELECT ON public.discount_codes FROM authenticated;
REVOKE SELECT ON public.discount_codes FROM anon;
GRANT SELECT ON public.discount_codes TO service_role;
-- Grant SELECT to authenticated only if they are an admin
CREATE POLICY "Admins can view all discount codes"
ON public.discount_codes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
