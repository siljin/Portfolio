import Image from "next/image";
import Link from "next/link";

export type HomeCardProps = {
  imageSrc?: string;
  imagePlaceholder: string;
  tags: string[];
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  detailHref: string;
  actionHref: string;
  actionLabel: string;
};

export function HomeCard({
  imageSrc,
  imagePlaceholder,
  tags,
  title,
  description,
  metric,
  metricLabel,
  detailHref,
  actionHref,
  actionLabel,
}: HomeCardProps) {
  return (
    <article className="project-card project-card--home-strip">
      <Link href={detailHref} className="project-card__stretched">
        <span className="sr-only">{title}</span>
      </Link>
      <div className="project-visual">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            width={800}
            height={450}
            sizes="280px"
          />
        ) : (
          <span className="placeholder">{imagePlaceholder}</span>
        )}
      </div>
      <div className="project-body">
        <div className="project-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="project-title">{title}</h3>
        <p className="project-desc">{description}</p>
        <div className="project-footer">
          <div className="metric">
            <div className="metric-value">{metric}</div>
            <div className="metric-label">{metricLabel}</div>
          </div>
          <a
            href={actionHref}
            target="_blank"
            rel="noopener noreferrer"
            className="read-link"
          >
            {actionLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden={true}
            >
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
