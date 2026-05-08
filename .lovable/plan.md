
## Goal

1. Actually walk through both the **sign-up** and **sign-in** flows myself in the browser tool (not just read code) and report what works and what breaks.
2. Audit and fix every place "the month" drives a tracker, dashboard widget, or leaderboard so the values are correct and the period toggles actually do something.

---

## Part 1 — In-browser verification (no code changes)

I will run the browser tool against the published site and capture screenshots + console/network at each step.

A. **New-user sign-up end-to-end**
- Open `/signup`, register a throwaway email, accept terms.
- Confirm: account is created, auto-signed-in, redirected to `/dashboard`.
- Verify the Welcome toast, that `handle_new_user` ran (profile + 14-day trial row), that `check_daily_login` awarded +10 pts, and that the Monthly Points card shows the correct month, my points, my rank, and "Days Left".
- Verify the referral path by signing up a second account with `?ref=<first-user-id>` and checking referral row + raffle ticket.

B. **Existing-user sign-in**
- Sign in with a known account, confirm redirect to `/dashboard`, no error toasts, subscription/founder status resolved.
- Reload to confirm session persists and there's no white-screen / chunk-load error after the recent SW kill-switch deploy.

C. **Tracker walk-through**
- Visit `/dashboard`, `/leaderboard`, the Monthly Points card, and the Profile referral card; capture each tracker's current values vs. what the DB returns.
- Toggle Weekly / Monthly / All-Time on the leaderboard and observe whether the data actually changes.

I'll write up findings before touching code. If the browser tool can't start, I'll say so and continue with the code fixes below.

---

## Part 2 — "Month" bugs to fix

Concrete defects identified from the codebase audit:

### 2.1 Leaderboard period toggle is fake
`src/pages/Leaderboard.tsx` and `src/components/points/PointsLeaderboard.tsx` both render Weekly / Monthly / All-Time tabs, but clicking them only updates local `period` state — `getLeaderboard()` always calls `get_points_leaderboard` which is hard-coded to the current month. Same for `get_user_points_rank`.

Fix:
- Extend `usePoints` so `getLeaderboard(period)` and the rank query take a period argument.
- Add new RPCs `get_points_leaderboard_period(_period text, _limit int)` and `get_user_points_rank_period(_user_id uuid, _period text)` that compute totals from `user_points.created_at` for:
  - `weekly` → last 7 days rolling (`created_at >= now() - interval '7 days'`)
  - `monthly` → current calendar month (existing behavior)
  - `all-time` → no date filter, sum of `user_points.points`
- Wire the period state into the React Query keys so switching tabs actually refetches.

### 2.2 Monthly card shows wrong month at month boundary
`PointsDisplay.tsx` builds the label with `new Date().toLocaleString('default', { month: 'long', year: 'numeric' })`, but `getDaysRemaining()` returns `0` on the final day of the month and the totals come from `user_points_monthly` keyed by `to_char(now(), 'YYYY-MM')` (UTC). On the 1st of the month in a negative-UTC timezone, the label says the new month while the DB still serves the old one (and vice-versa).

Fix:
- Compute `currentMonth` label and the `month_year` key from the same source: a small helper `getCurrentMonthKey()` that uses UTC consistently (matching the DB's `to_char(now(), 'YYYY-MM')`).
- Make `getDaysRemaining()` return at least `1` on the last calendar day so the card never reads "0 Days Left".

### 2.3 Daily-login tracker can skip a day
`check_daily_login` keys on Postgres `CURRENT_DATE` (UTC) but the client triggers it on local mount. A user in UTC-8 logging in at 9pm gets credit for "today UTC", then at 10pm it's already "tomorrow UTC" and the second login awards points again, while a 1am user in UTC+4 sees the day flip mid-session.

Fix:
- Pass the client's local date (YYYY-MM-DD) into `check_daily_login(_user_id uuid, _local_date date default null)`; if provided, use it instead of `CURRENT_DATE`.
- Update `usePoints.checkDailyLogin()` to send the local date.

### 2.4 Monthly Points "Total" is monthly-only but labelled ambiguously
The big number in the card is the **monthly** total (`user_points_monthly.total_points`), but the label "Total Points" reads as lifetime. Either:
- Rename to "This Month" (small, frontend-only), or
- Show both: "This Month" + an "All-Time" sub-stat fetched via the new all-time RPC.

I'll go with the second option to match the leaderboard fix.

### 2.5 Dashboard "Joined / Member since" month
Verify `EnhancedDashboard` and `ReferralCard` format `created_at` with the user's locale, not the raw ISO. (Quick spot-fix if needed; flagged for completeness, not yet a confirmed defect.)

---

## Technical details

Files to change:
- `supabase/migrations/*` — new SQL functions `get_points_leaderboard_period`, `get_user_points_rank_period`, updated `check_daily_login` signature (kept backward-compatible).
- `src/hooks/usePoints.tsx` — accept `period`, send `localDate`, expose all-time totals, fix `getDaysRemaining` floor.
- `src/components/points/PointsLeaderboard.tsx` and `src/pages/Leaderboard.tsx` — wire `period` into the query, refetch on toggle.
- `src/components/points/PointsDisplay.tsx` — unified month key/label, "This Month" + "All-Time" stats.
- `src/components/dashboard/EnhancedDashboard.tsx` / `ReferralCard.tsx` — only if browser test confirms a label issue.

No schema changes to tables, only new/updated functions, so the Supabase types file stays valid.

---

## Out of scope

- Changing the underlying point values or what actions earn points.
- Redesigning the leaderboard layout.
- Anything unrelated to "month/tracker" bugs surfaced during testing.

After you approve, I'll run Part 1 first, paste the findings, then implement Part 2 and verify with another browser pass.
