"use client";

import { List, Network, Play } from "lucide-react";
import type { Project } from "@/lib/applications";
import { DiagramModal } from "@/components/DiagramModal";
import { renderBlocks } from "@/components/detail/renderBlock";
import { MetaStripBlock } from "@/components/detail/blocks/MetaStripBlock";
import { PreviewPaneBlock } from "@/components/detail/blocks/PreviewPaneBlock";
import { IconAction } from "@/components/ui/IconAction";
import {
  getApplicationPrimaryCtaLabel,
  getPublicEyebrow,
  hasUsableHref,
} from "@/lib/content/display";
import { getSite } from "@/lib/site";
import type { DetailBlock } from "@/lib/content/types";

type ApplicationDetailPanelProps = {
  project?: Project;
  showArchModal: boolean;
  showSeqModal: boolean;
  onOpenArchitecture: () => void;
  onOpenSequence: () => void;
  onCloseArchitecture: () => void;
  onCloseSequence: () => void;
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

function getBodyBlocks(blocks: DetailBlock[]) {
  const skipped: Partial<Record<DetailKind, boolean>> = {};
  const promotedKinds = new Set<DetailKind>(["tagRow", "metaStrip", "previewPane"]);

  return blocks.filter((block) => {
    if (promotedKinds.has(block.kind) && !skipped[block.kind]) {
      skipped[block.kind] = true;
      return false;
    }
    return true;
  });
}

function splitTags(tag: string) {
  return tag
    .split(" · ")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ApplicationDetailPanel({
  project,
  showArchModal,
  showSeqModal,
  onOpenArchitecture,
  onOpenSequence,
  onCloseArchitecture,
  onCloseSequence,
}: ApplicationDetailPanelProps) {
  const { labels, applicationsEmptyState } = getSite();

  if (!project) {
    return (
      <main className="projects-content">
        <div className="projects-content-header">
          <div className="projects-content-eyebrow">{applicationsEmptyState.eyebrow}</div>
          <h2 className="projects-content-title">{applicationsEmptyState.title}</h2>
        </div>
      </main>
    );
  }

  const detailBlocks = project.detail?.blocks;
  const metaStrip = getFirstBlock(detailBlocks, "metaStrip");
  const primaryPreview = getFirstBlock(detailBlocks, "previewPane");
  const bodyBlocks = detailBlocks ? getBodyBlocks(detailBlocks) : [];
  const tags = splitTags(project.tag);
  const eyebrow = getPublicEyebrow(project.eyebrow, project.category);
  const showPrimaryCta = hasUsableHref(project.tryItUrl);
  const primaryCtaLabel = getApplicationPrimaryCtaLabel(
    detailBlocks,
    labels.tryItApplications,
  );
  const hasPrimaryVisual = Boolean(primaryPreview || project.coverSrc);

  return (
    <main className="projects-content application-detail-content">
      <article className="application-detail">
        <section
          className={`application-detail-hero${
            hasPrimaryVisual ? "" : " application-detail-hero--no-visual"
          }`}
        >
          <div className="application-detail-hero__copy">
            <div className="projects-content-eyebrow application-detail-eyebrow">
              {eyebrow}
            </div>
            <h2 className="projects-content-title application-detail-title">
              {project.title}
            </h2>
            <p className="application-detail-summary">{project.descriptor}</p>

            <div className="application-detail-actions">
              {showPrimaryCta ? (
                <IconAction
                  href={project.tryItUrl}
                  icon={Play}
                >
                  {primaryCtaLabel}
                </IconAction>
              ) : null}
              {project.architectureDiagram ? (
                <IconAction
                  onClick={onOpenArchitecture}
                  icon={Network}
                  variant="secondary"
                >
                  {labels.viewArchitecture}
                </IconAction>
              ) : null}
              {project.sequenceDiagram ? (
                <IconAction
                  onClick={onOpenSequence}
                  icon={List}
                  variant="secondary"
                >
                  {labels.sequenceDiagram}
                </IconAction>
              ) : null}
            </div>

            {tags.length > 0 ? (
              <div className="application-detail-tags">
                {tags.map((tag) => (
                  <span key={tag} className="detail-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {hasPrimaryVisual ? (
            <div className="application-detail-visual">
              {primaryPreview ? (
                <PreviewPaneBlock
                  image={primaryPreview.image}
                  url={primaryPreview.url}
                  caption={primaryPreview.caption}
                  chrome={primaryPreview.chrome}
                />
              ) : (
                <PreviewPaneBlock
                  image={project.coverSrc}
                  caption={project.title}
                  chrome="none"
                />
              )}
            </div>
          ) : null}
        </section>

        {metaStrip ? (
          <div className="application-detail-strip">
            <MetaStripBlock cells={metaStrip.cells} />
          </div>
        ) : null}

        {project.detail ? (
          bodyBlocks.length > 0 ? (
            <div className="application-detail-body detail-blocks">
              {renderBlocks(bodyBlocks)}
            </div>
          ) : null
        ) : (
          <div className="application-detail-body">
            {project.highlight && (
              <div className="projects-content-highlight">
                <div className="projects-highlight-label">{labels.highlight}</div>
                <div className="projects-highlight-text">{project.highlight}</div>
              </div>
            )}

            {project.sections?.length ? (
              <div className="projects-content-sections">
                {project.sections.map((section) => (
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

      {showArchModal && project.architectureDiagram && (
        <DiagramModal
          title={labels.architectureModalTitle}
          projectTitle={project.title}
          diagramUrl={project.architectureDiagram}
          onClose={onCloseArchitecture}
        />
      )}

      {showSeqModal && project.sequenceDiagram && (
        <DiagramModal
          title={labels.sequenceModalTitle}
          projectTitle={project.title}
          diagramUrl={project.sequenceDiagram}
          onClose={onCloseSequence}
        />
      )}
    </main>
  );
}
