import { getProjects } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectGrid() {
  const projects = getProjects();

  return (
    <div className="projects-band">
      <div className="container">
        <section className="block" id="projects">
          <div className="section-head">
            <div className="eyebrow">Builder</div>
            <h2 className="section-title">AI product <em>prototypes.</em></h2>
            <p className="section-desc">
              Things I built for myself — because the best way to understand product is to ship one.
            </p>
          </div>

          <div className="projects">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}

            <a href="/projects" className="view-all" aria-label="View all projects">
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
                  <div className="va-title">View all projects</div>
                  <div className="va-desc">Everything I've built on the side — prototypes, experiments, tools.</div>
                  <span className="va-btn">
                    View all
                    <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                  {/* <div className="va-count">8 projects</div> */}
                </div>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
