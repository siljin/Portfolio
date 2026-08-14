"use client";

import { ExternalLink } from "lucide-react";
import { renderBlocks } from "@/components/detail/renderBlock";
import { MetaStripBlock } from "@/components/detail/blocks/MetaStripBlock";
import { PreviewPaneBlock } from "@/components/detail/blocks/PreviewPaneBlock";
import { IconAction } from "@/components/ui/IconAction";
import { getPublicEyebrow, hasUsableHref } from "@/lib/content/display";
import { getSite } from "@/lib/site";
import type { Project } from "@/lib/projects";
import type { DetailBlock } from "@/lib/content/types";

type DetailKind = DetailBlock["kind"];
type DetailBlockOfKind<K extends DetailKind> = Extract<DetailBlock, { kind: K }>;

function getFirstBlock<K extends DetailKind>(
  blocks: DetailBlock[] | undefined,
  kind: K,
): DetailBlockOfKind<K> | undefined {
  return blocks?.find((block): block is DetailBlockOfKind<K> => block.kind === kind);
}

/**
 * Promotes the first tag row, meta strip and preview pane out of the body,
 * because the hero above renders them itself. Also drops the heading that
 * introduces the promoted meta strip, which would otherwise be left stranded.
 */
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

/**
 * A single case study's content. Shared by the `/projects/<slug>/` route and
 * the in-place archive, so both render identical markup.
 */
export function ProjectCaseDetail({ project }: { project: Project }) {
  const { labels } = getSite();
  const detailBlocks = project.detail?.blocks;
  const metaStrip = getFirstBlock(detailBlocks, "metaStrip");
  const primaryPreview = getFirstBlock(detailBlocks, "previewPane");
  const bodyBlocks = detailBlocks ? getProjectBodyBlocks(detailBlocks) : [];
  const eyebrow = getPublicEyebrow(project.eyebrow);
  const category = project.category.trim();
  const showDeckCta = hasUsableHref(project.deckUrl);
  const hasPrimaryVisual = Boolean(primaryPreview || project.imageSrc);

  return (
    <article className="prototype-detail project-detail">
      <section
        className={`prototype-detail-hero project-detail-hero${
          hasPrimaryVisual ? "" : " prototype-detail-hero--no-visual"
        }`}
      >
        <div className="prototype-detail-hero__copy project-detail-hero__copy">
          {category ? (
            <div className="detail-category-badge project-detail-category-badge">
              <span className="detail-category-badge__label">Category</span>
              <span>{category}</span>
            </div>
          ) : null}
          {eyebrow ? (
            <div className="projects-content-eyebrow prototype-detail-eyebrow">{eyebrow}</div>
          ) : null}
          <h2 className="projects-content-title prototype-detail-title">{project.title}</h2>
          <p className="prototype-detail-summary">{project.desc}</p>

          <div className="prototype-detail-actions">
            {showDeckCta ? (
              <IconAction href={project.deckUrl} icon={ExternalLink}>
                {labels.viewDeck}
              </IconAction>
            ) : null}
          </div>

          {project.tags.length > 0 ? (
            <div className="prototype-detail-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="detail-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {hasPrimaryVisual ? (
          <div className="prototype-detail-visual project-detail-visual">
            {primaryPreview ? (
              <PreviewPaneBlock
                image={primaryPreview.image}
                url={primaryPreview.url}
                caption={primaryPreview.caption}
                chrome={primaryPreview.chrome}
              />
            ) : project.imageSrc ? (
              <PreviewPaneBlock image={project.imageSrc} caption={project.title} chrome="none" />
            ) : null}
          </div>
        ) : null}
      </section>

      {metaStrip ? (
        <div className="prototype-detail-strip project-detail-strip">
          <MetaStripBlock cells={metaStrip.cells} />
        </div>
      ) : null}

      {project.detail ? (
        bodyBlocks.length > 0 ? (
          <div className="prototype-detail-body project-detail-body detail-blocks">
            {renderBlocks(bodyBlocks)}
          </div>
        ) : null
      ) : (
        <div className="prototype-detail-body project-detail-body">
          <div className="projects-content-metrics">
            <div className="projects-metric-block">
              <div className="projects-metric-value">{project.metric1}</div>
              <div className="projects-metric-label">{project.metric1Label}</div>
            </div>
            <div className="projects-metric-block">
              <div className="projects-metric-value">{project.metric2}</div>
              <div className="projects-metric-label">{project.metric2Label}</div>
            </div>
          </div>

          {project.sections && project.sections.length > 0 ? (
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
  );
}
