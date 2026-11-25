/**
 * Security headers for every page the server renders. Static files (images, fonts, scripts)
 * get the same list from public/_headers, which Cloudflare applies to them; keep both in step.
 *
 * The content policy starts in report-only mode: the browser logs what it would block without
 * blocking it. Once the live site shows no reports (YouTube, fonts and uploaded images all
 * load), rename it to Content-Security-Policy. Uploads served from R2 on another address need
 * adding to img-src and media-src.
 *
 * static.cloudflareinsights.com and cloudflareinsights.com: Cloudflare Web Analytics, which
 * Cloudflare adds to every page (visit counts, no cookies; stated in the privacy policy).
 *
 * The Meta and Google addresses are for the landing page's ad pixels (src/lib/ads.ts). They're
 * allowed on every page because a visitor who reaches the landing page through a link keeps the
 * policy of the page they arrived on; the pixels themselves load only on the landing page, and
 * only after consent.
 */
export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy-Report-Only": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://connect.facebook.net https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://i.ytimg.com https://www.facebook.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://www.google.co.il",
    "media-src 'self' blob:",
    "font-src 'self'",
    "frame-src https://www.youtube-nocookie.com https://td.doubleclick.net https://www.googletagmanager.com",
    "connect-src 'self' https://cloudflareinsights.com https://www.facebook.com https://connect.facebook.net https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};
