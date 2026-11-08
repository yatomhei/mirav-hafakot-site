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
import { Contact } from "@/components/sections/Contact";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell beforeFooter={<Contact />}>
      <Hero />
      <About />
      <Works />
      <Stills />
      <Services />
      <Process />
      <Testimonials />
      <Faq />
      <PhotoStrip />
    </PageShell>
  );
}
