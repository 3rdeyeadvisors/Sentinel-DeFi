/**
 * Brand constants for consistent branding across the application
 * IMPORTANT: Always use Sentinel DeFi
 */

export const BRAND_NAME = "Sentinel DeFi";
export const BRAND_AUTHOR = "Sentinel DeFi Research Team";
export const BRAND_EMAIL = "info@sentineldefi.online";
export const BRAND_DOMAIN = "sentineldefi.online";
export const BRAND_URL = "https://sentineldefi.online";

/**
 * Subscription Pricing - Single source of truth
 * Update these values when prices change
 */
export const PRICING = {
  monthly: {
    amount: 99,
    display: "$99",
    period: "/month",
    stripePrice: "price_1SfmuFLxeGPiI62jZkGuCmqm",
  },
  annual: {
    amount: 1188,
    display: "$1,188",
    period: "/year",
    stripePrice: "price_1Sl04YLxeGPiI62jjtRmPeC9",
  },
};

/**
 * Annual subscriber premium benefits
 */
export const ANNUAL_BENEFITS = {
  earlyAccessDays: 7,
};
