import { getProjects } from "@/lib/applications";
import { getSite } from "@/lib/site";
import { HomeCarousel } from "@/components/HomeCarousel";
import { HomeCard } from "@/components/HomeCard";
import { Reveal } from "@/components/Reveal";
import { getApplicationPrimaryCtaLabel } from "@/lib/content/display";

export function Applications() {
  const allApplications = getProjects();
  const { home, labels } = getSite();
  const s = home.applicationsSection;

  return (
    <div className="applications-band">
      <div className="container">
        <section className="block" id="applications">
          <Reveal className="section-head">
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="section-title">
              {s.titleBeforeEm}
              <em>{s.titleEmphasis}</em>
            </h2>
            <p className="section-desc">{s.description}</p>
          </Reveal>

          <HomeCarousel
            itemCount={allApplications.length}
            carouselPrevious={labels.projectsCarouselPrevious}
            carouselNext={labels.projectsCarouselNext}
          >
            {allApplications.map((app) => (
              <HomeCard
                key={app.id}
                imageSrc={app.coverSrc}
                imagePlaceholder={labels.projectImagePlaceholder}
                eyebrow={app.eyebrow}
                tags={app.tag.split(" · ")}
                title={app.title}
                description={app.descriptor}
                metric={app.metric}
                metricLabel={app.metricLabel}
                detailHref={`/applications?id=${app.id}`}
                actionHref={app.tryItUrl}
                actionLabel={getApplicationPrimaryCtaLabel(
                  app.detail?.blocks,
                  labels.tryItApplications,
                )}
              />
            ))}
          </HomeCarousel>
        </section>
      </div>
    </div>
  );
}
