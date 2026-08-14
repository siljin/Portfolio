import { getProjects } from "@/lib/prototypes";
import { getSite } from "@/lib/site";
import { HomeCarousel } from "@/components/HomeCarousel";
import { HomeCard } from "@/components/HomeCard";
import { Reveal } from "@/components/Reveal";
import { getPrototypePrimaryCtaLabel } from "@/lib/content/display";

export function Prototypes() {
  const allPrototypes = getProjects();
  const { home, labels } = getSite();
  const s = home.prototypesSection;

  return (
    <div className="prototypes-band">
      <div className="container">
        <section className="block" id="prototypes">
          <Reveal className="section-head">
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="section-title">
              {s.titleBeforeEm}
              <em>{s.titleEmphasis}</em>
            </h2>
            <p className="section-desc">{s.description}</p>
          </Reveal>

          <HomeCarousel
            itemCount={allPrototypes.length}
            carouselPrevious={labels.projectsCarouselPrevious}
            carouselNext={labels.projectsCarouselNext}
          >
            {allPrototypes.map((app) => (
              <HomeCard
                key={app.id}
                imageSrc={app.coverSrc}
                imageFit={app.id === "mba-tech-club" ? "contain" : "cover"}
                imageBackdrop={app.id === "prior-auth" ? "prior-auth" : "default"}
                imagePlaceholder={labels.projectImagePlaceholder}
                eyebrow={app.eyebrow}
                tags={app.tag.split(" · ")}
                maxTags={3}
                title={app.title}
                description={app.descriptor}
                metric={app.metric}
                metricLabel={app.metricLabel}
                detailHref={`/prototypes/${app.slug}/`}
                actionHref={app.tryItUrl}
                actionLabel={getPrototypePrimaryCtaLabel(
                  app.detail?.blocks,
                  labels.tryItPrototypes,
                )}
              />
            ))}
          </HomeCarousel>
        </section>
      </div>
    </div>
  );
}
