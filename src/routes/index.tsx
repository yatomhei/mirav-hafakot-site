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
      {/* The intro drifts slower than the page; works + stills catch up and slide over it.
          overflow: clip keeps the drifting intro from showing below them. */}
      <div className="relative [overflow:clip]">
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
