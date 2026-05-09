/**
 * Admin role checks must always go through the database (`user_roles` table).
 * Hardcoding admin emails in client code leaks identity and is bypassable.
 */
export const isAdminEmail = (email: string | undefined | null) => {
  if (!email) return false;
  const adminEmails = ['kevinguerrier.kg@gmail.com'];
  return adminEmails.includes(email.toLowerCase());
};
