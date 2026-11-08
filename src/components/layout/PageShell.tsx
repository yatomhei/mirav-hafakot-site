import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { VideoPlayerProvider } from "@/components/ui/VideoPlayer";
import { Contact } from "@/components/sections/Contact";

/**
 * Header, page content, the contact form, footer and the floating WhatsApp button — shared
 * by every page, so every "דברו איתי" link can jump to #contact on the page it is on.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <VideoPlayerProvider>
      <a href="#main" className="skip-link">
        דילוג לתוכן
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
        <Contact />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </VideoPlayerProvider>
  );
}
