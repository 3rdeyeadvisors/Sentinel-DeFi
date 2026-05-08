-- SQL Helpers for standardized time/period logic
-- Ensures consistency between application logic and database calculations

-- Function to get current month in YYYY-MM format (UTC)
CREATE OR REPLACE FUNCTION public.get_current_month_utc()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM');
$$;

-- Function to get current date in YYYY-MM-DD format (UTC)
CREATE OR REPLACE FUNCTION public.get_current_date_utc()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
$$;

-- Standardize existing functions to use these helpers
CREATE OR REPLACE FUNCTION public.award_user_points(
  _user_id UUID,
  _points INTEGER,
  _action_type TEXT,
  _action_id TEXT DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(success BOOLEAN, points_awarded INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month TEXT;
  multiplier DECIMAL := 1.0;
  final_points INTEGER;
  is_founding33 BOOLEAN;
  config_points INTEGER;
  caller_id UUID := auth.uid();
BEGIN
  -- SECURITY CHECK
  IF caller_id IS NOT NULL AND caller_id != _user_id THEN
    RETURN QUERY SELECT false, 0, 'Unauthorized: Cannot award points to another user';
    RETURN;
  END IF;

  -- Get authoritative points from config
  SELECT points INTO config_points FROM public.point_configs WHERE action_type = _action_type;

  -- If action type is unknown, use the provided points as fallback
  IF config_points IS NULL THEN
    final_points := _points;
  ELSE
    final_points := config_points;
  END IF;

  -- Use standardized helper
  current_month := public.get_current_month_utc();

  -- Check for Founding 33 status (1.5x multiplier)
  SELECT EXISTS (
    SELECT 1 FROM public.founding33_purchases
    WHERE founding33_purchases.user_id = _user_id AND status = 'completed'
  ) INTO is_founding33;

  IF is_founding33 THEN
    multiplier := multiplier * 1.5;
  END IF;

  final_points := FLOOR(final_points * multiplier);

  BEGIN
    INSERT INTO public.user_points (user_id, points, action_type, action_id, month_year, metadata)
    VALUES (_user_id, final_points, _action_type, _action_id, current_month,
            _metadata || jsonb_build_object('base_points', COALESCE(config_points, _points), 'multiplier', multiplier));
  EXCEPTION WHEN unique_violation THEN
    RETURN QUERY SELECT false, 0, 'Points already awarded for this action this month';
    RETURN;
  END;

  INSERT INTO public.user_points_monthly (user_id, month_year, total_points, updated_at)
  VALUES (_user_id, current_month, final_points, now())
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    total_points = user_points_monthly.total_points + EXCLUDED.total_points,
    updated_at = now();

  RETURN QUERY SELECT true, final_points, 'Points awarded successfully';
END;
$$;

-- Update period-aware leaderboard to use standardized month check
CREATE OR REPLACE FUNCTION public.get_points_leaderboard_period(_period text DEFAULT 'monthly', _limit integer DEFAULT 10)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, total_points integer, rank bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  WITH totals AS (
    SELECT
      up.user_id,
      SUM(up.points)::int AS total_points
    FROM public.user_points up
    WHERE
      CASE
        WHEN _period = 'weekly'  THEN up.created_at >= now() - interval '7 days'
        WHEN _period = 'monthly' THEN up.month_year = public.get_current_month_utc()
        ELSE TRUE
      END
    GROUP BY up.user_id
  )
  SELECT
    t.user_id,
    p.display_name,
    p.avatar_url,
    t.total_points,
    ROW_NUMBER() OVER (ORDER BY t.total_points DESC) AS rank
  FROM totals t
  LEFT JOIN public.profiles p ON p.user_id = t.user_id
  ORDER BY t.total_points DESC
  LIMIT _limit;
$$;
