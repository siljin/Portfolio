import { ExternalLink, Play } from "lucide-react";
import { IconAction } from "@/components/ui/IconAction";
import { normalizeCtaLabel } from "@/lib/content/display";

type CtaBlockProps = {
  label: string;
  href: string;
  note?: string;
};

export function CtaBlock({ label, href, note }: CtaBlockProps) {
  const normalizedLabel = normalizeCtaLabel(label);
  const Icon = /try|workflow|demo/i.test(normalizedLabel) ? Play : ExternalLink;

  return (
    <div className="detail-block detail-cta">
      <IconAction
        href={href}
        icon={Icon}
        className="detail-cta__btn"
      >
        {normalizedLabel}
      </IconAction>
      {note && <span className="detail-cta__note">{note}</span>}
    </div>
  );
}
