

# One-Time Platform Upgrade Email

## Approach

Create a dedicated edge function `send-platform-upgrade-email` that:
1. Verifies admin authentication
2. Fetches all real subscribers (excluding bots)
3. Sends a professionally formatted HTML email with your exact content
4. Logs each send to `email_logs`
5. Returns success/failure counts

## Email Details

- **From:** `3rdeyeadvisors <info@the3rdeyeadvisors.com>` (via Resend)
- **Subject:** "the platform just got a major upgrade"
- **Recipients:** All 10 real subscribers
- **Template:** Clean, light-background email with your exact copy preserved, including the em-dash bullet points and signature block

## How to Send

After the function is deployed, you will call it from your browser console or admin panel while logged in as admin. I will provide the exact command.

## Technical Details

### New file: `supabase/functions/send-platform-upgrade-email/index.ts`

- Admin-only (checks `user_roles` for admin)
- Fetches subscribers from DB, excludes bot accounts
- Sends via Resend with 600ms rate limiting between emails
- HTML email template with:
  - White/light background for maximum email client compatibility
  - Purple 3EA branded header
  - Your exact copy with proper paragraph spacing
  - Em-dash bullet list styled as a clean list
  - Signature block with Kevin's name, title, and links
  - Footer with website links and disclaimer
- Logs each send (success/fail) to `email_logs` table

### After deployment

I will give you a one-line command to run from your admin dashboard's browser console to trigger the send. You must be logged in as admin.

### Cleanup

After confirming the emails were sent successfully, we can delete this one-off function.
