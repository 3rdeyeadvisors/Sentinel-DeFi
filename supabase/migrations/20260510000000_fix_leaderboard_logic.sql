-- Fix Leaderboard logic to use standardized calendar windows
-- Standardizes 'weekly' to start of current week (Monday UTC)
-- Standardizes 'monthly' to start of current month (1st of month UTC)

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
        WHEN _period = 'weekly'  THEN up.created_at >= date_trunc('week', now() AT TIME ZONE 'UTC')
        WHEN _period = 'monthly' THEN up.created_at >= date_trunc('month', now() AT TIME ZONE 'UTC')
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
  WHERE t.total_points > 0
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
        WHEN _period = 'weekly'  THEN up.created_at >= date_trunc('week', now() AT TIME ZONE 'UTC')
        WHEN _period = 'monthly' THEN up.created_at >= date_trunc('month', now() AT TIME ZONE 'UTC')
        ELSE TRUE
      END
    GROUP BY up.user_id
    HAVING SUM(up.points) > 0
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
