import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { VideoPlayerProvider } from "@/components/ui/VideoPlayer";

/** Header, page content, footer and the floating WhatsApp button — shared by every page. */
export function PageShell({
  children,
  beforeFooter,
}: {
  children: ReactNode;
  beforeFooter?: ReactNode;
}) {
  return (
    <VideoPlayerProvider>
      <a href="#main" className="skip-link">
        דילוג לתוכן
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
        {beforeFooter}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </VideoPlayerProvider>
  );
}
