"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArchiveNav } from "@/components/ArchiveNav";
import { getSite } from "@/lib/site";
import type { Project } from "@/lib/projects";

export type ProjectsCaseArchiveProps = {
  cases: Project[];
};

/**
 * Case-study archive: sidebar list + detail (used by /projects and any embed).
 */
export function ProjectsCaseArchive({ cases }: ProjectsCaseArchiveProps) {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState(queryId || cases[0]?.id || "");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const { projectsArchive, labels } = getSite();

  useEffect(() => {
    if (queryId) {
      setSelectedId(queryId);
    }
  }, [queryId]);

  const selectedCase = cases.find((c) => c.id === selectedId);

  return (
    <>
      <ArchiveNav />

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
              aria-label={isSidebarExpanded ? labels.collapseSidebar : labels.expandSidebar}
              aria-expanded={isSidebarExpanded}
              aria-controls="projects-sidebar-list"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11.5 4.5V19.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <h1 className="projects-sidebar-title">{projectsArchive.sidebarTitle}</h1>
            <p className="projects-sidebar-subtitle">{projectsArchive.sidebarSubtitle}</p>
          </div>
          <ul className="projects-list" id="projects-sidebar-list">
            {cases.map((caseItem, index) => (
              <li key={caseItem.id} className="projects-item">
                <button
                  type="button"
                  className={`projects-btn ${selectedId === caseItem.id ? "active" : ""}`}
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
                {selectedCase.deckUrl ? (
                  <a
                    href={selectedCase.deckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="projects-read-btn"
                  >
                    {labels.viewDeck}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden={true}
                    >
                      <path d="M5 12h14M17 12l-4-4M17 12l-4 4" />
                    </svg>
                  </a>
                ) : null}
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
                  <div className="projects-metric-label">{selectedCase.metric1Label}</div>
                </div>
                <div className="projects-metric-block">
                  <div className="projects-metric-value">{selectedCase.metric2}</div>
                  <div className="projects-metric-label">{selectedCase.metric2Label}</div>
                </div>
              </div>

              {selectedCase.sections && selectedCase.sections.length > 0 ? (
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
              ) : null}
            </>
          ) : (
            <div className="projects-content-header">
              <div className="projects-content-eyebrow">{projectsArchive.emptyEyebrow}</div>
              <h2 className="projects-content-title">{projectsArchive.emptyTitle}</h2>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
