"use client";

import { List, Network, Play } from "lucide-react";
import type { Project } from "@/lib/prototypes";
import { DiagramModal } from "@/components/DiagramModal";
import { renderBlocks } from "@/components/detail/renderBlock";
import { MetaStripBlock } from "@/components/detail/blocks/MetaStripBlock";
import { PreviewPaneBlock } from "@/components/detail/blocks/PreviewPaneBlock";
import { IconAction } from "@/components/ui/IconAction";
import {
  getPrototypePrimaryCtaLabel,
  getPublicEyebrow,
  hasUsableHref,
} from "@/lib/content/display";
import { getSite } from "@/lib/site";
import type { DetailBlock } from "@/lib/content/types";

type PrototypeDetailPanelProps = {
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

/**
 * `pageHero` is the detail route's title block. This panel renders its own
 * hero from `project.title` / `descriptor`, so keeping it would duplicate the
 * heading. It is dropped rather than promoted.
 */
const PANEL_SKIPPED_KINDS = new Set<DetailKind>(["pageHero"]);

/**
 * A `columns` block is a page-width layout. In this narrow panel its children
 * are unwrapped and rendered in source order, so a two-up row does not squeeze
 * into half a sidebar.
 */
function flattenColumns(blocks: DetailBlock[]): DetailBlock[] {
  return blocks.flatMap((block) =>
    block.kind === "columns" ? flattenColumns(block.items) : [block]
  );
}

function getBodyBlocks(blocks: DetailBlock[]) {
  const skipped: Partial<Record<DetailKind, boolean>> = {};
  const promotedKinds = new Set<DetailKind>(["tagRow", "metaStrip", "previewPane"]);

  return flattenColumns(blocks).filter((block) => {
    if (PANEL_SKIPPED_KINDS.has(block.kind)) return false;
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

export function PrototypeDetailPanel({
  project,
  showArchModal,
  showSeqModal,
  onOpenArchitecture,
  onOpenSequence,
  onCloseArchitecture,
  onCloseSequence,
}: PrototypeDetailPanelProps) {
  const { labels, prototypesEmptyState } = getSite();

  if (!project) {
    return (
      <main className="projects-content">
        <div className="projects-content-header">
          <div className="projects-content-eyebrow">{prototypesEmptyState.eyebrow}</div>
          <h2 className="projects-content-title">{prototypesEmptyState.title}</h2>
        </div>
      </main>
    );
  }

  const detailBlocks = project.detail?.blocks;
  const metaStrip = getFirstBlock(detailBlocks, "metaStrip");
  const primaryPreview = getFirstBlock(detailBlocks, "previewPane");
  const bodyBlocks = detailBlocks ? getBodyBlocks(detailBlocks) : [];
  const tags = splitTags(project.tag);
  const category = project.category?.trim();
  const eyebrow = getPublicEyebrow(project.eyebrow);
  const showPrimaryCta = hasUsableHref(project.tryItUrl);
  const primaryCtaLabel = getPrototypePrimaryCtaLabel(
    detailBlocks,
    labels.tryItPrototypes,
  );
  const hasPrimaryVisual = Boolean(primaryPreview || project.coverSrc);

  return (
    <main className="projects-content prototype-detail-content">
      <article className="prototype-detail">
        <section
          className={`prototype-detail-hero${
            hasPrimaryVisual ? "" : " prototype-detail-hero--no-visual"
          }`}
        >
          <div className="prototype-detail-hero__copy">
            {category ? (
              <div className="detail-category-badge">
                <span className="detail-category-badge__label">Category</span>
                <span>{category}</span>
              </div>
            ) : null}
            {eyebrow ? (
              <div className="projects-content-eyebrow prototype-detail-eyebrow">
                {eyebrow}
              </div>
            ) : null}
            <h2 className="projects-content-title prototype-detail-title">
              {project.title}
            </h2>
            <p className="prototype-detail-summary">{project.descriptor}</p>

            <div className="prototype-detail-actions">
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
              <div className="prototype-detail-tags">
                {tags.map((tag) => (
                  <span key={tag} className="detail-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {hasPrimaryVisual ? (
            <div className="prototype-detail-visual">
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
          <div className="prototype-detail-strip">
            <MetaStripBlock cells={metaStrip.cells} />
          </div>
        ) : null}

        {project.detail ? (
          bodyBlocks.length > 0 ? (
            <div className="prototype-detail-body detail-blocks">
              {renderBlocks(bodyBlocks)}
            </div>
          ) : null
        ) : (
          <div className="prototype-detail-body">
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
