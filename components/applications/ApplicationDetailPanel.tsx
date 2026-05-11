import type { Project } from "@/lib/applications";
import { DiagramModal } from "@/components/DiagramModal";

type ApplicationDetailPanelProps = {
  project?: Project;
  showArchModal: boolean;
  showSeqModal: boolean;
  onOpenArchitecture: () => void;
  onOpenSequence: () => void;
  onCloseArchitecture: () => void;
  onCloseSequence: () => void;
};

export function ApplicationDetailPanel({
  project,
  showArchModal,
  showSeqModal,
  onOpenArchitecture,
  onOpenSequence,
  onCloseArchitecture,
  onCloseSequence,
}: ApplicationDetailPanelProps) {
  if (!project) {
    return (
      <main className="projects-content">
        <div className="projects-content-header">
          <div className="projects-content-eyebrow">Select a project</div>
          <h2 className="projects-content-title">Choose from the list</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="projects-content">
      <div className="projects-content-header">
        <h2 className="projects-content-title">{project.title}</h2>
        <div className="projects-content-actions">
          {project.tryItUrl && (
            <a
              href={project.tryItUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="projects-try-btn"
            >
              Try it
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M17 12l-4-4M17 12l-4 4" />
              </svg>
            </a>
          )}
          {project.architectureDiagram && (
            <button onClick={onOpenArchitecture} className="projects-try-btn">
              View Architecture
            </button>
          )}
          {project.sequenceDiagram && (
            <button onClick={onOpenSequence} className="projects-try-btn">
              Sequence Diagram
            </button>
          )}
        </div>
      </div>

      <p className="projects-content-desc">{project.descriptor}</p>

      {project.highlight && (
        <div className="projects-content-highlight">
          <div className="projects-highlight-label">Highlight</div>
          <div className="projects-highlight-text">{project.highlight}</div>
        </div>
      )}

      <div className="projects-content-tags">
        {project.tag.split(" · ").map((tag) => (
          <span key={tag} className="projects-tag">
            {tag}
          </span>
        ))}
      </div>

      {project.sections?.length > 0 && (
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
      )}

      {showArchModal && project.architectureDiagram && (
        <DiagramModal
          title="Architecture Diagram"
          projectTitle={project.title}
          diagramUrl={project.architectureDiagram}
          onClose={onCloseArchitecture}
        />
      )}

      {showSeqModal && project.sequenceDiagram && (
        <DiagramModal
          title="Sequence Diagram"
          projectTitle={project.title}
          diagramUrl={project.sequenceDiagram}
          onClose={onCloseSequence}
        />
      )}
    </main>
  );
}
