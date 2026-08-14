"use client";

import Link from "next/link";
import { useState } from "react";
import { List, Network } from "lucide-react";
import { DiagramModal } from "@/components/DiagramModal";
import { IconAction } from "@/components/ui/IconAction";
import { renderBlocks } from "@/components/detail/renderBlock";
import type { Project } from "@/lib/prototypes";
import { getSite } from "@/lib/site";

/**
 * Prototype detail page.
 *
 * The page's content comes from `detail.blocks` in
 * `content/prototypes/prototypes.json` — including its title, which the
 * `pageHero` block owns. Nothing here is written per prototype, so adding a
 * section to any prototype page is a JSON edit.
 *
 * The narrative `sections` render below the blocks, and the architecture /
 * sequence diagram buttons stay because they are driven by top-level fields
 * rather than by block content.
 */
export default function ClientDetail({ project }: { project: Project }) {
  const [showArchModal, setShowArchModal] = useState(false);
  const [showSeqModal, setShowSeqModal] = useState(false);
  const { labels } = getSite();

  const blocks = project.detail?.blocks ?? [];
  const hasDiagramActions = Boolean(project.architectureDiagram || project.sequenceDiagram);

  return (
    <article className="projectPage projectPage--blocks">
      <Link href="/#prototypes" className="projectPageBack">
        {labels.backToPrototypes}
      </Link>

      {blocks.length > 0 ? (
        <div className="detail-blocks">{renderBlocks(blocks)}</div>
      ) : (
        // An prototype with no block composition still needs a title.
        <>
          <span className="projectPageTag mono">{project.tag}</span>
          <h1>{project.title}</h1>
          <p className="projectPageLead">{project.descriptor}</p>
        </>
      )}

      {hasDiagramActions ? (
        <div className="projectPageActions">
          {project.architectureDiagram && (
            <IconAction
              onClick={() => setShowArchModal(true)}
              icon={Network}
              variant="secondary"
              className="projectPageBtn projectPageBtn--secondary"
            >
              {labels.viewArchitecture}
            </IconAction>
          )}
          {project.sequenceDiagram && (
            <IconAction
              onClick={() => setShowSeqModal(true)}
              icon={List}
              variant="secondary"
              className="projectPageBtn projectPageBtn--secondary"
            >
              {labels.sequenceDiagram}
            </IconAction>
          )}
        </div>
      ) : null}

      {project.sections.map((s) => (
        <section key={s.title} className="projectPageSection">
          <h2>{s.title}</h2>
          <div className="projectPageSection__body">
            {s.paragraphs.map((p, i) => (
              <p key={`${s.title}-${i}`}>{p}</p>
            ))}
          </div>
        </section>
      ))}

      {showArchModal && project.architectureDiagram && (
        <DiagramModal
          title={labels.architectureModalTitle}
          projectTitle={project.title}
          diagramUrl={project.architectureDiagram}
          onClose={() => setShowArchModal(false)}
        />
      )}

      {showSeqModal && project.sequenceDiagram && (
        <DiagramModal
          title={labels.sequenceModalTitle}
          projectTitle={project.title}
          diagramUrl={project.sequenceDiagram}
          onClose={() => setShowSeqModal(false)}
        />
      )}
    </article>
  );
}
