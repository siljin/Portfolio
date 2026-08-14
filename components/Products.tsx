import { getResolvedProducts } from "@/lib/products.server";
import { getSite } from "@/lib/site";
import { HomeCarousel } from "@/components/HomeCarousel";
import { HomeCard } from "@/components/HomeCard";
import { Reveal } from "@/components/Reveal";
import { getPrimaryCtaLabel } from "@/lib/content/display";

/**
 * Shipped products — the section that outranks prototypes.
 *
 * Same card and carousel machinery as `Prototypes`, with two deliberate
 * differences: the band is visually heavier, and each card leads with a status
 * chip plus how far it reaches rather than a metric pair, because being in real
 * use is the claim these make.
 */
export function Products() {
  const allProducts = getResolvedProducts();
  const { home, labels } = getSite();
  const s = home.productsSection;

  return (
    <div className="products-band">
      <div className="container">
        <section className="block" id="products">
          <Reveal className="section-head">
            <div className="eyebrow">{s.eyebrow}</div>
            <h2 className="section-title">
              {s.titleBeforeEm}
              <em>{s.titleEmphasis}</em>
            </h2>
            <p className="section-desc">{s.description}</p>
          </Reveal>

          <HomeCarousel
            itemCount={allProducts.length}
            carouselPrevious={labels.projectsCarouselPrevious}
            carouselNext={labels.projectsCarouselNext}
          >
            {allProducts.map((product) => (
              <HomeCard
                key={product.id}
                imageSrc={product.coverSrc}
                imageFit={product.coverFit ?? "cover"}
                imagePlaceholder={labels.projectImagePlaceholder}
                eyebrow={product.eyebrow}
                tags={product.tag.split(" · ")}
                maxTags={3}
                title={product.title}
                description={product.descriptor}
                statusLabel={product.status.label}
                statusTone={product.status.tone}
                usedBy={product.usedBy}
                detailHref={`/products/${product.slug}/`}
                actionHref={product.tryItUrl ?? ""}
                actionLabel={getPrimaryCtaLabel(
                  product.detail?.blocks,
                  labels.tryItProducts,
                )}
              />
            ))}
          </HomeCarousel>
        </section>
      </div>
    </div>
  );
}
