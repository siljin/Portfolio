import { getProjects } from "@/lib/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectGrid() {
  const projects = getProjects();

  return (
    <section id="projects">
      <div className="section-label">Builder</div>
      <h2 className="section-title">Projects - AI Product Prototypes</h2>
      <p className="section-sub">
        Things I built for myself — because the best way to understand product
        is to ship one.
      </p>
      <div className="projects-grid">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
