/**
 * Admin role checks must always go through the database (`user_roles` table).
 * Hardcoding admin emails in client code leaks identity and is bypassable.
 *
 * This helper is intentionally a no-op so any leftover callers fall back to the
 * server-side role check.
 */
export const isAdminEmail = (_email: string | undefined | null) => false;
