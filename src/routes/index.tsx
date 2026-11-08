import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { WorksBand } from "@/components/sections/WorksBand";
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
      <About />
      <WorksBand />
      <Services />
      <Process />
      <Testimonials />
      <Faq />
      <PhotoStrip />
    </PageShell>
  );
}
