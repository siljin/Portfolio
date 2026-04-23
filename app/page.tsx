import { CaseStudies } from "@/components/CaseStudies";
import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { PeekHint } from "@/components/PeekHint";
import { ProjectGrid } from "@/components/ProjectGrid";

export default function Home() {
  return (
    <main>
      <div className="grid-bg"></div>
      <div className="ambient"></div>
      <Hero />
      <PeekHint />
      <ProjectGrid />
      <CaseStudies />
      <ContactSection />
    </main>
  );
}
