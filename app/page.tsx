import { Projects } from "@/components/Projects";
import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { PeekHint } from "@/components/PeekHint";
import { ApplicationGrid } from "@/components/ApplicationGrid";

export default function Home() {
  return (
    <main>
      <div className="grid-bg"></div>
      <div className="ambient"></div>
      <Hero />
      <PeekHint />
      <ApplicationGrid />
      <Projects />
      <ContactSection />
    </main>
  );
}
