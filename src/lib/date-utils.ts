/**
 * Standardized date utilities for Sentinel DeFi platform.
 * Ensures consistency between frontend and backend (PostgreSQL) calculations.
 */

/**
 * Returns current month in YYYY-MM format (UTC).
 * Matches PostgreSQL to_char(now(), 'YYYY-MM')
 */
export const getCurrentMonthUTC = () => {
  return new Date().toISOString().slice(0, 7);
};

/**
 * Returns current date in YYYY-MM-DD format (UTC).
 */
export const getCurrentDateUTC = () => {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Returns current local date in YYYY-MM-DD format.
 */
export const getLocalDate = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Returns number of days remaining in the current month (local time).
 * Always returns at least 1.
 */
export const getDaysRemainingInMonth = () => {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(1, endOfMonth.getDate() - now.getDate());
};

/**
 * Returns start of today in UTC ISO string.
 */
export const getStartOfTodayUTC = () => {
  return `${getCurrentDateUTC()}T00:00:00Z`;
};

/**
 * Returns end of today in UTC ISO string.
 */
export const getEndOfTodayUTC = () => {
  return `${getCurrentDateUTC()}T23:59:59Z`;
};
