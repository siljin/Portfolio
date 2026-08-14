import { Play } from "lucide-react";
import type { DetailBlock } from "@/lib/content/types";

type PageHeroProps = Omit<Extract<DetailBlock, { kind: "pageHero" }>, "kind">;

/**
 * The page's opening statement: badge, title, body, primary action.
 *
 * This block owns the detail route's hero. `ClientDetail` renders no title of
 * its own, so every application's `detail.blocks` must supply one.
 */
export function PageHeroBlock({ badge, title, body, cta }: PageHeroProps) {
  return (
    <div className="detail-hero">
      {badge ? <span className="detail-hero__badge">{badge}</span> : null}
      <h1 className="detail-hero__title">{title}</h1>
      {body ? <p className="detail-hero__body">{body}</p> : null}
      {cta ? (
        <a className="detail-hero__cta" href={cta.href} target="_blank" rel="noopener noreferrer">
          <Play size={14} aria-hidden="true" />
          {cta.label}
        </a>
      ) : null}
    </div>
  );
}
