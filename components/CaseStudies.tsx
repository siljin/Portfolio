export function CaseStudies() {
  const cases = [
    {
      title: "Habit-Loop Retention Feature",
      description:
        "Worked with the DS team to identify 30-day churn signals. Built a daily digest feature to reinforce habit formation.",
      tags: ["Retention", "Data"],
      metric: "−15%",
      metricLabel: "30-day churn",
    },
    {
      title: "Search Overhaul",
      description:
        "Rebuilt search from the ground up — semantic ranking, filter redesign, and a new results layout. Shipped in 8 weeks.",
      tags: ["0→1", "Search"],
      metric: "+40%",
      metricLabel: "search success rate",
    },
  ];

  return (
    <div className="container">
      <section className="block" id="work">
        <div className="section-head">
          <div className="eyebrow">Work</div>
          <h2 className="section-title">Case <em>studies.</em></h2>
          <p className="section-desc">
            A selection of the problems I&apos;ve worked on, the decisions I made, and what happened.
          </p>
        </div>

        <div className="cases">
          {cases.map((c) => (
            <article key={c.title} className="case-card">
              <div className="case-visual">
                <span className="placeholder">Screenshot / Mockup</span>
              </div>
              <div className="case-body">
                <div className="case-tags">
                  {c.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="case-title">{c.title}</h3>
                <p className="case-desc">{c.description}</p>
                <div className="case-footer">
                  <div className="metric">
                    <div className="metric-value">{c.metric}</div>
                    <div className="metric-label">{c.metricLabel}</div>
                  </div>
                  <a href="#" className="read-link">
                    Read
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}

          <a href="/case-studies" className="view-all" aria-label="View all case studies">
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
                <div className="va-title">View all case studies</div>
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
