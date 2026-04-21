import Link from "next/link";

export function About() {
  return (
    <section id="about">
      <div className="section-label">About</div>
      <h2 className="section-title">A bit about me</h2>
      <div className="about-grid">
        <div className="about-text">
          <p>
            I&apos;m an <strong>MBA candidate at UT Austin McCombs</strong> with
            five years building enterprise software at scale, from software
            engineer to delivery lead.
          </p>
          <p>
            Before the MBA, I shipped systems most people never see but always
            depend on: <strong>data pipelines moving millions of records</strong>
            , APIs connecting fragmented platforms, and a{" "}
            <strong>GenAI retrieval tool that cut analyst work by hundreds of hours a year</strong>. That background shapes how I think:
            I read a P&amp;L and a system diagram with equal comfort, and I write
            specs that engineering teams actually want to build.
          </p>
          <Link href="#contact" className="btn btnPrimary">
            Get in touch
          </Link>
        </div>
        <div className="about-visual">headshot / photo</div>
      </div>
    </section>
  );
}
