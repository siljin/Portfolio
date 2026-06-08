"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { List, Network, Play } from "lucide-react";
import { DiagramModal } from "@/components/DiagramModal";
import { IconAction } from "@/components/ui/IconAction";
import {
  getApplicationPrimaryCtaLabel,
  hasUsableHref,
} from "@/lib/content/display";
import type { Project } from "@/lib/applications";
import { getSite } from "@/lib/site";

export default function ClientDetail({ project }: { project: Project }) {
  const [showArchModal, setShowArchModal] = useState(false);
  const [showSeqModal, setShowSeqModal] = useState(false);
  const { labels } = getSite();
  const primaryCtaLabel = getApplicationPrimaryCtaLabel(
    project.detail?.blocks,
    labels.tryIt,
  );
  const showPrimaryCta = hasUsableHref(project.tryItUrl);

  return (
    <article className="projectPage">
      <Link href="/#applications" className="projectPageBack">
        {labels.backToApplications}
      </Link>
      {project.category ? (
        <div className="detail-category-badge projectPageCategory">
          <span className="detail-category-badge__label">Category</span>
          <span>{project.category}</span>
        </div>
      ) : null}
      <span className="projectPageTag mono">{project.tag}</span>
      <h1>{project.title}</h1>
      <p className="projectPageLead">{project.descriptor}</p>
      <Image
        className="projectPageImg"
        src={project.coverSrc}
        alt=""
        width={800}
        height={450}
        priority
      />

      <div className="projectPageActions">
        {showPrimaryCta ? (
          <IconAction href={project.tryItUrl} icon={Play} className="projectPageBtn">
            {primaryCtaLabel}
          </IconAction>
        ) : null}
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

      {project.sections.map((s) => (
        <section key={s.title} className="projectPageSection">
          <h2>{s.title}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={`${s.title}-${i}`}>{p}</p>
          ))}
          {s.diagramSrc && (
            <div className="projectPageDiagram">
              <Image
                src={s.diagramSrc}
                alt={`${s.title} diagram`}
                width={800}
                height={600}
              />
            </div>
          )}
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
