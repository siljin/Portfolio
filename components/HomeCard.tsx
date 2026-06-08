import Image from "next/image";
import Link from "next/link";

export type HomeCardProps = {
  imageSrc?: string;
  imagePlaceholder: string;
  eyebrow: string;
  tags: string[];
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  detailHref: string;
  actionHref: string;
  actionLabel: string;
};

/**
 * Returns the first complete sentence as a curated hook, so cards end on a
 * natural thought instead of a chopped "...". Abbreviations like "U.S." are
 * protected so they don't get mistaken for a sentence boundary.
 */
function makeHook(text: string) {
  const protectedText = text
    .trim()
    .replace(
      /\b(U\.S|e\.g|i\.e|etc|vs|Inc|Corp|Ltd|Dr|Mr|Mrs|Ms|Jr|Sr|St|No|Co)\./gi,
      "$1·",
    )
    .replace(/\b([A-Za-z])\./g, "$1·");

  const match = protectedText.match(/^[\s\S]*?[.!?](?=\s|$)/);
  const sentence = (match ? match[0] : protectedText).replace(/·/g, ".");
  return sentence.replace(/\s*[.!?]+\s*$/, "");
}

function hasMetric(metric: string, metricLabel: string) {
  return metric.trim() !== "—" && metricLabel.trim() !== "—";
}

export function HomeCard({
  imageSrc,
  imagePlaceholder,
  eyebrow,
  tags,
  title,
  description,
  metric,
  metricLabel,
  detailHref,
  actionHref,
  actionLabel,
}: HomeCardProps) {
  const visibleTags = tags.slice(0, 2);
  const showMetric = hasMetric(metric, metricLabel);
  const showAction = actionHref.trim() !== "" && actionHref.trim() !== "#";

  return (
    <article className="project-card project-card--home-strip">
      <Link href={detailHref} className="project-card__stretched">
        <span className="sr-only">{title}</span>
      </Link>
      <div className="project-visual project-visual--cover">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            width={800}
            height={450}
            sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 50vw, 33vw"
          />
        ) : (
          <span className="placeholder">{imagePlaceholder}</span>
        )}
      </div>

      <div className="project-body">
        <div className="project-eyebrow">{eyebrow}</div>
        <h3 className="project-title">{title}</h3>
        <p className="project-desc">{makeHook(description)}</p>

        <div className="project-chip-row">
          {showMetric ? (
            <span className="metric-chip">
              {metric} · {metricLabel}
            </span>
          ) : null}
          {visibleTags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        {showAction ? (
          <a
            href={actionHref}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card-cta"
            aria-label={`${actionLabel}: ${title}`}
          >
            {actionLabel}
            <svg
              className="project-card-cta__arrow"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden={true}
            >
              <path d="M7 17 17 7" />
              <path d="M9 7h8v8" />
            </svg>
          </a>
        ) : null}
      </div>
    </article>
  );
}
