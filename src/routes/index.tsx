import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Works } from "@/components/sections/Works";
import { Stills } from "@/components/sections/Stills";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { PhotoStrip } from "@/components/sections/PhotoStrip";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell>
      <Hero />
      {/* The intro pins while works + stills scroll up over it (together taller than the viewport). */}
      <div className="relative">
        <About />
        <Works />
        <Stills />
      </div>
      <Services />
      <Process />
      <Testimonials />
      <Faq />
      <PhotoStrip />
    </PageShell>
  );
}
