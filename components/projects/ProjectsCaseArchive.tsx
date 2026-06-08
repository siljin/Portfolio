"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { renderBlocks } from "@/components/detail/renderBlock";
import { MetaStripBlock } from "@/components/detail/blocks/MetaStripBlock";
import { PreviewPaneBlock } from "@/components/detail/blocks/PreviewPaneBlock";
import { getSite } from "@/lib/site";
import type { Project } from "@/lib/projects";
import type { DetailBlock } from "@/lib/content/types";

export type ProjectsCaseArchiveProps = {
  cases: Project[];
};

type DetailKind = DetailBlock["kind"];
type DetailBlockOfKind<K extends DetailKind> = Extract<DetailBlock, { kind: K }>;

function getFirstBlock<K extends DetailKind>(
  blocks: DetailBlock[] | undefined,
  kind: K,
): DetailBlockOfKind<K> | undefined {
  return blocks?.find(
    (block): block is DetailBlockOfKind<K> => block.kind === kind,
  );
}

function getProjectBodyBlocks(blocks: DetailBlock[]) {
  const firstMetaIndex = blocks.findIndex((block) => block.kind === "metaStrip");
  const headingBeforeFirstMetaIndex =
    firstMetaIndex > 0 && blocks[firstMetaIndex - 1]?.kind === "heading"
      ? firstMetaIndex - 1
      : -1;
  const skipped: Partial<Record<DetailKind, boolean>> = {};
  const promotedKinds = new Set<DetailKind>(["tagRow", "metaStrip", "previewPane"]);

  return blocks.filter((block, index) => {
    if (index === headingBeforeFirstMetaIndex) return false;
    if (promotedKinds.has(block.kind) && !skipped[block.kind]) {
      skipped[block.kind] = true;
      return false;
    }
    return true;
  });
}

function hasUsableHref(href?: string) {
  const trimmed = href?.trim();
  return Boolean(trimmed && trimmed !== "#");
}

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
  const detailBlocks = selectedCase?.detail?.blocks;
  const metaStrip = getFirstBlock(detailBlocks, "metaStrip");
  const primaryPreview = getFirstBlock(detailBlocks, "previewPane");
  const bodyBlocks = detailBlocks ? getProjectBodyBlocks(detailBlocks) : [];
  const eyebrow = selectedCase
    ? [selectedCase.eyebrow, selectedCase.category].filter(Boolean).join(" · ")
    : "";
  const showDeckCta = hasUsableHref(selectedCase?.deckUrl);
  const hasPrimaryVisual = Boolean(primaryPreview || selectedCase?.imageSrc);

  return (
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

        <main className="projects-content application-detail-content project-detail-content">
          {selectedCase ? (
            <article className="application-detail project-detail">
              <section
                className={`application-detail-hero project-detail-hero${
                  hasPrimaryVisual ? "" : " application-detail-hero--no-visual"
                }`}
              >
                <div className="application-detail-hero__copy project-detail-hero__copy">
                  <div className="projects-content-eyebrow application-detail-eyebrow">
                    {eyebrow}
                  </div>
                  <h2 className="projects-content-title application-detail-title">
                    {selectedCase.title}
                  </h2>
                  <p className="application-detail-summary">{selectedCase.desc}</p>

                  <div className="application-detail-actions">
                    {showDeckCta ? (
                      <a
                        href={selectedCase.deckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="application-detail-action application-detail-action--primary"
                      >
                        {labels.viewDeck}
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden={true}
                        >
                          <path d="M7 17 17 7" />
                          <path d="M9 7h8v8" />
                        </svg>
                      </a>
                    ) : null}
                  </div>

                  {selectedCase.tags.length > 0 ? (
                    <div className="application-detail-tags">
                      {selectedCase.tags.map((tag) => (
                        <span key={tag} className="detail-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {hasPrimaryVisual ? (
                  <div className="application-detail-visual project-detail-visual">
                    {primaryPreview ? (
                      <PreviewPaneBlock
                        image={primaryPreview.image}
                        url={primaryPreview.url}
                        caption={primaryPreview.caption}
                        chrome={primaryPreview.chrome}
                      />
                    ) : selectedCase.imageSrc ? (
                      <PreviewPaneBlock
                        image={selectedCase.imageSrc}
                        caption={selectedCase.title}
                        chrome="none"
                      />
                    ) : null}
                  </div>
                ) : null}
              </section>

              {metaStrip ? (
                <div className="application-detail-strip project-detail-strip">
                  <MetaStripBlock cells={metaStrip.cells} />
                </div>
              ) : null}

              {selectedCase.detail ? (
                bodyBlocks.length > 0 ? (
                  <div className="application-detail-body project-detail-body detail-blocks">
                    {renderBlocks(bodyBlocks)}
                  </div>
                ) : null
              ) : (
                <div className="application-detail-body project-detail-body">
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
                </div>
              )}
            </article>
          ) : (
            <div className="projects-content-header">
              <div className="projects-content-eyebrow">{projectsArchive.emptyEyebrow}</div>
              <h2 className="projects-content-title">{projectsArchive.emptyTitle}</h2>
            </div>
          )}
      </main>
    </div>
  );
}
