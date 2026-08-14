import { getProjects } from "@/lib/projects";
import { getSite } from "@/lib/site";
import { HomeCarousel } from "@/components/HomeCarousel";
import { HomeCard } from "@/components/HomeCard";
import { Reveal } from "@/components/Reveal";

export function Projects() {
  const allProjects = getProjects();
  const { home, labels } = getSite();
  const s = home.projectsSection;

  return (
    <div className="container">
      <section className="block" id="projects">
        <Reveal className="section-head">
          <div className="eyebrow">{s.eyebrow}</div>
          <h2 className="section-title">
            {s.titleBeforeEm}
            <em>{s.titleEmphasis}</em>
          </h2>
          <p className="section-desc">{s.description}</p>
        </Reveal>

        <HomeCarousel
          itemCount={allProjects.length}
          carouselPrevious={labels.projectsCarouselPrevious}
          carouselNext={labels.projectsCarouselNext}
        >
          {allProjects.map((project) => (
            <HomeCard
              key={project.id}
              imageSrc={project.imageSrc}
              imageFit={
                project.id === "waystar" || project.id === "costco"
                  ? "contain"
                  : "cover"
              }
              imageBackdrop={
                project.id === "waystar" || project.id === "costco"
                  ? project.id
                  : "default"
              }
              imagePlaceholder={labels.projectImagePlaceholder}
              eyebrow={project.eyebrow}
              tags={project.tags}
              title={project.title}
              description={project.desc}
              metric={project.metric1}
              metricLabel={project.metric1Label}
              detailHref={`/projects/${project.slug}/`}
              actionHref={project.deckUrl}
              actionLabel={labels.viewDeck}
            />
          ))}
        </HomeCarousel>
      </section>
    </div>
  );
}
