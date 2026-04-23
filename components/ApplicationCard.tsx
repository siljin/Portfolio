import type { Project } from "@/lib/applications";

type ApplicationCardProps = {
  project: Project;
};

export function ApplicationCard({ project }: ApplicationCardProps) {
  const tags = project.tag.split(" · ");

  return (
    <article className="application-card">
      <div className="application-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={project.iconPath} />
        </svg>
      </div>
      <h3 className="application-title">{project.title}</h3>
      <p className="application-desc">{project.descriptor}</p>
      <div className="application-tags">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      <div className="application-actions">
        <a href="#" className="read-link">
          Read
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
        <a href={project.tryItUrl} target="_blank" rel="noopener noreferrer" className="try-btn">
          Try it
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
      </div>
    </article>
  );
}
