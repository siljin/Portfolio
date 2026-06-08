import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import { IconAction } from "@/components/ui/IconAction";
import { getPublicEyebrow, normalizeCtaLabel } from "@/lib/content/display";

export type HomeCardProps = {
  imageSrc?: string;
  imageFit?: "cover" | "contain";
  imageBackdrop?: "default" | "prior-auth" | "waystar" | "costco";
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
  maxTags?: number;
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
  imageFit = "cover",
  imageBackdrop = "default",
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
  maxTags = 2,
}: HomeCardProps) {
  const publicEyebrow = getPublicEyebrow(eyebrow);
  const visibleTags = tags.slice(0, maxTags);
  const showMetric = hasMetric(metric, metricLabel);
  const showAction = actionHref.trim() !== "" && actionHref.trim() !== "#";
  const normalizedActionLabel = normalizeCtaLabel(actionLabel);
  const ActionIcon = /try|workflow|demo/i.test(normalizedActionLabel)
    ? Play
    : ExternalLink;

  return (
    <article className="project-card project-card--home-strip">
      <Link href={detailHref} className="project-card__stretched">
        <span className="sr-only">{title}</span>
      </Link>
      <div
        className={`project-visual project-visual--${imageFit} project-visual--${imageBackdrop}`}
      >
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
        {publicEyebrow ? (
          <div className="project-eyebrow">{publicEyebrow}</div>
        ) : null}
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
          <IconAction
            href={actionHref}
            icon={ActionIcon}
            className="project-card-cta"
            ariaLabel={`${normalizedActionLabel}: ${title}`}
          >
            {normalizedActionLabel}
          </IconAction>
        ) : null}
      </div>
    </article>
  );
}
