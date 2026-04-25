import Link from "next/link";
import { getProjects } from "@/lib/applications";
import { ApplicationCard } from "./ApplicationCard";

export function ApplicationGrid() {
  const allProjects = getProjects();
  const projects = allProjects.slice(0, 2);

  return (
    <div className="applications-band">
      <div className="container">
        <section className="block" id="applications">
          <div className="section-head">
            <div className="eyebrow">Builder</div>
            <h2 className="section-title">AI <em>applications.</em></h2>
            <p className="section-desc">
              Things I built - because the best way to understand product is to ship one.
            </p>
          </div>

          <div className="applications">
            {projects.map((p) => (
              <ApplicationCard key={p.slug} project={p} />
            ))}

            <Link href="/applications" className="view-all" aria-label="View all applications">
              <div className="stack">
                <div className="stack-layer back-2"></div>
                <div className="stack-layer back-1"></div>
                <div className="stack-layer front">
                  <div className="va-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="7" width="14" height="14" rx="2" />
                      <path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
                    </svg>
                  </div>
                  <div className="va-title">View all applications</div>
                  <div className="va-desc">Everything I&apos;ve built on the side — prototypes, experiments, tools.</div>
                  <span className="va-btn">
                    View all
                    <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                  {/* <div className="va-count">8 applications</div> */}
                </div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
