"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/lib/projects";

type ProjectsArchiveClientProps = {
  cases: Project[];
};

function ProjectsArchiveContent({ cases }: ProjectsArchiveClientProps) {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState(queryId || cases[0]?.id || "");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    if (queryId) {
      setSelectedId(queryId);
    }
  }, [queryId]);

  const selectedCase = cases.find((c) => c.id === selectedId);

  return (
    <>
      <nav className="archive-nav">
        <div className="nav-inner">
          <Link href="/" className="logo">
            Siljin Sebastian<span className="dot">.</span>
          </Link>
          <Link href="/" className="back-link">
            <svg
              className="arrow"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to portfolio
          </Link>
        </div>
      </nav>

      <div
        className={`projects-layout-wrapper applications-layout ${
          isSidebarExpanded ? "is-expanded" : ""
        }`}
      >
        <aside className="projects-sidebar">
          <div className="projects-sidebar-header">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarExpanded((prev) => !prev)}
              aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={isSidebarExpanded}
              aria-controls="projects-sidebar-list"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11.5 4.5V19.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <h1 className="projects-sidebar-title">Case Studies</h1>
            <p className="projects-sidebar-subtitle">Select to explore</p>
          </div>
          <ul className="projects-list" id="projects-sidebar-list">
            {cases.map((caseItem, index) => (
              <li key={caseItem.id} className="projects-item">
                <button
                  className={`projects-btn ${
                    selectedId === caseItem.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedId(caseItem.id)}
                  aria-label={caseItem.title}
                >
                  <span className="projects-btn-icon" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="projects-btn-tooltip" aria-hidden="true">
                    {caseItem.title}
                  </span>
                  <span className="projects-btn-copy">
                    <span className="projects-btn-title">{caseItem.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="projects-content">
          {selectedCase ? (
            <>
              <div className="projects-content-header">
                <h2 className="projects-content-title">{selectedCase.title}</h2>
                {selectedCase.deckUrl && (
                  <a
                    href={selectedCase.deckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="projects-read-btn"
                  >
                    View Deck
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M17 12l-4-4M17 12l-4 4" />
                    </svg>
                  </a>
                )}
              </div>

              <p className="projects-content-desc">{selectedCase.desc}</p>

              <div className="projects-content-tags">
                {selectedCase.tags.map((tag) => (
                  <span key={tag} className="projects-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="projects-content-metrics">
                <div className="projects-metric-block">
                  <div className="projects-metric-value">{selectedCase.metric1}</div>
                  <div className="projects-metric-label">
                    {selectedCase.metric1Label}
                  </div>
                </div>
                <div className="projects-metric-block">
                  <div className="projects-metric-value">{selectedCase.metric2}</div>
                  <div className="projects-metric-label">
                    {selectedCase.metric2Label}
                  </div>
                </div>
              </div>

              {selectedCase.sections && selectedCase.sections.length > 0 && (
                <div className="projects-content-sections">
                  {selectedCase.sections.map((section) => (
                    <section key={section.title} className="content-section">
                      <h3 className="section-subtitle">{section.title}</h3>
                      {section.paragraphs.map((paragraph, idx) => (
                        <p key={idx} className="section-paragraph">
                          {paragraph}
                        </p>
                      ))}
                    </section>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="projects-content-header">
              <div className="projects-content-eyebrow">Select a case study</div>
              <h2 className="projects-content-title">Choose from the list</h2>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export function ProjectsArchiveClient({ cases }: ProjectsArchiveClientProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsArchiveContent cases={cases} />
    </Suspense>
  );
}
