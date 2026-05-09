DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
CREATE POLICY "User badges are viewable by authenticated users"
ON public.user_badges FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON public.comment_likes;
CREATE POLICY "Comment likes are viewable by authenticated users"
ON public.comment_likes FOR SELECT
TO authenticated
USING (true);