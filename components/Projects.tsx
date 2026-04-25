import { getProjects } from "@/lib/projects";

export function Projects() {
  const allProjects = getProjects();
  const cases = allProjects.slice(0, 2).map((project) => ({
    id: project.id,
    title: project.title,
    description: project.desc,
    tags: project.tags,
    metric: project.metric1,
    metricLabel: project.metric1Label,
    deckUrl: project.deckUrl,
    imageSrc: project.imageSrc,
  }));

  return (
    <div className="container">
      <section className="block" id="projects">
        <div className="section-head">
          <div className="eyebrow">Work</div>
          <h2 className="section-title">Research & <em>Projects.</em></h2>
          <p className="section-desc">
            A selection of the problems I&apos;ve worked on, the decisions I made, and what happened.
          </p>
        </div>

        <div className="projects">
          {cases.map((c) => (
            <article key={c.title} className="project-card">
              <div className="project-visual">
                {c.imageSrc ? (
                  <img src={c.imageSrc} alt={c.title} />
                ) : (
                  <span className="placeholder">Screenshot / Mockup</span>
                )}
              </div>
              <div className="project-body">
                <div className="project-tags">
                  {c.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="project-title">{c.title}</h3>
                <p className="project-desc">{c.description}</p>
                <div className="project-footer">
                  <div className="metric">
                    <div className="metric-value">{c.metric}</div>
                    <div className="metric-label">{c.metricLabel}</div>
                  </div>
                  <a href={`/projects?id=${c.id || ''}`} className="read-link">
                    Read
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}

          <a href="/projects" className="view-all" aria-label="View all case studies">
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
                <div className="va-desc">The full archive — shipped work, deep-dives, and retros.</div>
                <span className="va-btn">
                  View all
                  <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
                {/* <div className="va-count">12 studies</div> */}
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
