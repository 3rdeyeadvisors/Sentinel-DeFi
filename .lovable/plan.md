
# Fix Mini Games Page Crash

## The Problem

The mini games page (`src/pages/MiniGames.tsx`) uses a `<SEO>` component on line 164 but has no import statement for it. This causes the page to crash entirely — users see a blank screen or error when navigating to `/mini-games`.

The build errors listed are all inside Supabase Edge Functions (backend code) and do not affect the frontend. The root cause of the mini games section being broken is solely this missing import.

## The Fix

Add one import line at the top of `src/pages/MiniGames.tsx`:

```
import SEO from '@/components/SEO';
```

That is the only change needed. No other files need to be touched.

## What This Restores

Once the import is added, the full mini games page will work again:
- Memory Match
- Reaction Test
- Pattern Sequence
- Math Sprint
- IQ Assessment
- Cognitive Science dashboard
- Daily points tracking
