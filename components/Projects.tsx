import { getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site";
import { HomeCarousel } from "@/components/HomeCarousel";
import { HomeCard } from "@/components/HomeCard";

export function Projects() {
  const allProjects = getProjects();
  const { home, labels } = getSite();
  const s = home.projectsSection;

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

        <HomeCarousel
          itemCount={allProjects.length}
          carouselPrevious={labels.projectsCarouselPrevious}
          carouselNext={labels.projectsCarouselNext}
        >
          {allProjects.map((project) => (
            <HomeCard
              key={project.id}
              imageSrc={project.imageSrc}
              imagePlaceholder={labels.projectImagePlaceholder}
              tags={project.tags}
              title={project.title}
              description={project.desc}
              metric={project.metric1}
              metricLabel={project.metric1Label}
              detailHref={`/projects?id=${project.id}`}
              actionHref={project.deckUrl}
              actionLabel={labels.viewDeck}
            />
          ))}
        </HomeCarousel>
      </section>
    </div>
  );
}
