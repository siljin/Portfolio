import Image from "next/image";
import { getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site";

export function Projects() {
  const allProjects = getProjects();
  const { home, labels } = getSite();
  const s = home.projectsSection;
  const v = home.projectsViewAll;
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
          <div className="eyebrow">{s.eyebrow}</div>
          <h2 className="section-title">
            {s.titleBeforeEm}
            <em>{s.titleEmphasis}</em>
          </h2>
          <p className="section-desc">{s.description}</p>
        </div>

        <div className="projects">
          {cases.map((c) => (
            <article key={c.title} className="project-card">
              <div className="project-visual">
                {c.imageSrc ? (
                  <Image
                    src={c.imageSrc}
                    alt={c.title}
                    width={800}
                    height={450}
                    sizes="(max-width: 700px) 100vw, 50vw"
                  />
                ) : (
                  <span className="placeholder">{labels.projectImagePlaceholder}</span>
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
                  <a href={`/projects?id=${c.id}`} className="read-link">
                    {labels.read}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}

          <a href="/projects" className="view-all" aria-label={v.ariaLabel}>
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
                <div className="va-title">{v.title}</div>
                <div className="va-desc">{v.description}</div>
                <span className="va-btn">
                  {v.buttonLabel}
                  <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
