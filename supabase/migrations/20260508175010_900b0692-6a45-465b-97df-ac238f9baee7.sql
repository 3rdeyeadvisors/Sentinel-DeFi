-- Period-aware leaderboard
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
        WHEN _period = 'monthly' THEN up.month_year = to_char(now(), 'YYYY-MM')
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

CREATE OR REPLACE FUNCTION public.get_user_points_rank_period(_user_id uuid, _period text DEFAULT 'monthly')
RETURNS TABLE(total_points integer, rank bigint, total_users bigint)
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
        WHEN _period = 'monthly' THEN up.month_year = to_char(now(), 'YYYY-MM')
        ELSE TRUE
      END
    GROUP BY up.user_id
  ),
  ranked AS (
    SELECT user_id, total_points, ROW_NUMBER() OVER (ORDER BY total_points DESC) AS rank
    FROM totals
  ),
  total AS (SELECT COUNT(*)::bigint AS total_users FROM totals)
  SELECT
    COALESCE(r.total_points, 0)::int,
    COALESCE(r.rank, 0)::bigint,
    COALESCE(t.total_users, 0)::bigint
  FROM (SELECT _user_id AS user_id) u
  LEFT JOIN ranked r ON r.user_id = u.user_id
  CROSS JOIN total t;
$$;

-- Local-date-aware daily login (backwards compatible: NULL falls back to UTC date)
CREATE OR REPLACE FUNCTION public.check_daily_login(_user_id uuid, _local_date date DEFAULT NULL)
RETURNS TABLE(already_logged_in boolean, points_awarded integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  today DATE := COALESCE(_local_date, CURRENT_DATE);
  login_exists BOOLEAN;
  awarded_points INTEGER := 0;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.daily_logins dl
    WHERE dl.user_id = _user_id AND dl.login_date = today
  ) INTO login_exists;

  IF login_exists THEN
    RETURN QUERY SELECT true, 0;
    RETURN;
  END IF;

  INSERT INTO public.daily_logins (user_id, login_date, points_awarded)
  VALUES (_user_id, today, true)
  ON CONFLICT (user_id, login_date) DO NOTHING;

  SELECT aup.points_awarded INTO awarded_points
  FROM public.award_user_points(_user_id, 10, 'daily_login', today::TEXT) aup;

  RETURN QUERY SELECT false, COALESCE(awarded_points, 10);
END;
$$;