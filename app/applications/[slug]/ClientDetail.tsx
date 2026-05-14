"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DiagramModal } from "@/components/DiagramModal";
import type { Project } from "@/lib/applications";
import { getSite } from "@/lib/site";

export default function ClientDetail({ project }: { project: Project }) {
  const [showArchModal, setShowArchModal] = useState(false);
  const [showSeqModal, setShowSeqModal] = useState(false);
  const { labels } = getSite();

  return (
    <article className="projectPage">
      <Link href="/#applications" className="projectPageBack">
        {labels.backToApplications}
      </Link>
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
        <Link href={project.tryItUrl} className="projectPageBtn">
          {labels.tryIt}
        </Link>
        {project.architectureDiagram && (
          <button
            type="button"
            onClick={() => setShowArchModal(true)}
            className="projectPageBtn projectPageBtn--secondary"
          >
            {labels.viewArchitecture}
          </button>
        )}
        {project.sequenceDiagram && (
          <button
            type="button"
            onClick={() => setShowSeqModal(true)}
            className="projectPageBtn projectPageBtn--secondary"
          >
            {labels.sequenceDiagram}
          </button>
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
