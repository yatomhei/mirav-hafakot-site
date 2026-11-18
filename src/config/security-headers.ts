/**
 * Security headers for every page the server renders. Static files (images, fonts, scripts)
 * get the same list from public/_headers, which Cloudflare applies to them; keep both in step.
 *
 * The content policy starts in report-only mode: the browser logs what it would block without
 * blocking it. Once the live site shows no reports (YouTube, fonts and uploaded images all
 * load), rename it to Content-Security-Policy. Uploads served from R2 on another address need
 * adding to img-src and media-src.
 */
export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy-Report-Only": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://i.ytimg.com",
    "media-src 'self' blob:",
    "font-src 'self'",
    "frame-src https://www.youtube-nocookie.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
};
