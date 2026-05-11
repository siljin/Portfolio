import type { Project } from "@/lib/applications";

type ApplicationsSidebarProps = {
  projects: Project[];
  selectedId: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: (id: string) => void;
};

export function ApplicationsSidebar({
  projects,
  selectedId,
  isExpanded,
  onToggleExpand,
  onSelect,
}: ApplicationsSidebarProps) {
  function getIconText(index: number) {
    return String(index + 1).padStart(2, "0");
  }

  return (
    <aside className="projects-sidebar">
      <div className="projects-sidebar-header">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleExpand}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isExpanded}
          aria-controls="applications-sidebar-list"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11.5 4.5V19.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <h1 className="projects-sidebar-title">Applications</h1>
        <p className="projects-sidebar-subtitle">Select to explore</p>
      </div>
      <ul className="projects-list" id="applications-sidebar-list">
        {projects.map((project, index) => (
          <li key={project.id} className="projects-item">
            <button
              className={`projects-btn ${
                selectedId === project.id ? "active" : ""
              }`}
              onClick={() => onSelect(project.id)}
              aria-label={project.title}
            >
              <span className="projects-btn-icon" aria-hidden="true">
                {getIconText(index)}
              </span>
              <span className="projects-btn-tooltip" aria-hidden="true">
                {project.title}
              </span>
              <span className="projects-btn-copy">
                <span className="projects-btn-title">{project.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
