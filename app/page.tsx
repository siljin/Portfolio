import { Projects } from "@/components/Projects";
import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { PeekHint } from "@/components/PeekHint";
import { Products } from "@/components/Products";
import { Prototypes } from "@/components/Prototypes";

export default function Home() {
  return (
    <main>
      <div className="grid-bg"></div>
      <div className="ambient"></div>
      <Hero />
      <PeekHint />
      <Products />
      <Prototypes />
      <Projects />
      <ContactSection />
    </main>
  );
}
