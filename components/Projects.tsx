import { getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site";
import {
  ProjectsHomeCarousel,
  type HomeProjectCase,
} from "@/components/ProjectsHomeCarousel";

export function Projects() {
  const allProjects = getProjects();
  const { home, labels } = getSite();
  const s = home.projectsSection;

  const cases: HomeProjectCase[] = allProjects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.desc,
    tags: project.tags,
    metric: project.metric1,
    metricLabel: project.metric1Label,
    imageSrc: project.imageSrc,
  }));

  return (
    <div className="container">
      <section className="block" id="projects">
        <div className="section-head">
          <div className="eyebrow">{s.eyebrow}</div>
          <h2 className="section-title">
            {s.titleBeforeEm}
            <em>{s.titleEmphasis}</em>
          </h2>
          <p className="section-desc">{s.description}</p>
        </div>

        <ProjectsHomeCarousel
          cases={cases}
          readLabel={labels.read}
          imagePlaceholder={labels.projectImagePlaceholder}
          carouselPrevious={labels.projectsCarouselPrevious}
          carouselNext={labels.projectsCarouselNext}
        />
      </section>
    </div>
  );
}
