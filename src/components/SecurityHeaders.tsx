import { useEffect } from 'react';

// Security headers component to set important security headers
// App Store compatible - allows necessary inline scripts for React/Vite
const SecurityHeaders = () => {
  useEffect(() => {
    // Prevent duplicate meta tags
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) return;

    const setSecurityHeaders = () => {
      // Content Security Policy - App Store Compatible
      // Note: 'unsafe-inline' is required for React/Vite bundled apps
      // 'unsafe-eval' removed for security - not needed for production builds
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = [
        "default-src 'self'",
        // Scripts: allow self, CDNs, and inline (required for React)
        "script-src 'self' 'unsafe-inline' https://unpkg.com https://esm.sh https://*.stripe.com https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.tiktok.com",
        // Styles: allow self, Google Fonts, and inline (required for Tailwind/styled-components)
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        // Images: allow common sources
        "img-src 'self' data: https: blob: https://www.google-analytics.com https://analytics.tiktok.com",
        // Fonts: Google Fonts
        "font-src 'self' https://fonts.gstatic.com data:",
        // Connections: Supabase, Stripe, and other APIs
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://*.stripe.com https://api.stripe.com https://*.thirdweb.com https://*.ethereum.org https://*.infura.io https://*.alchemy.com https://www.google-analytics.com https://stats.g.doubleclick.net https://analytics.tiktok.com https://*.tiktok.com",
        // Frames: allow Stripe for payment processing
        "frame-src 'self' https://*.stripe.com https://js.stripe.com",
        // Restrict base URI
        "base-uri 'self'",
        // Restrict form submissions
        "form-action 'self' https://*.stripe.com",
        // Upgrade HTTP to HTTPS
        "upgrade-insecure-requests"
      ].join('; ');
      document.head.appendChild(cspMeta);

      // Referrer Policy - Balanced privacy and functionality
      const referrerMeta = document.createElement('meta');
      referrerMeta.name = 'referrer';
      referrerMeta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(referrerMeta);

    };

    setSecurityHeaders();
  }, []);

  return null;
};

export default SecurityHeaders;
