import { detailIcons } from "@/components/detail/iconRegistry";
import type { FeatureItem } from "@/lib/content/types";

type FeaturePanelProps = {
  title: string;
  columns?: 2 | 3 | 4;
  items: FeatureItem[];
};

/** A titled card holding a row of icon / title / body entries. */
export function FeaturePanelBlock({ title, columns, items }: FeaturePanelProps) {
  const cols = columns ?? (Math.min(items.length, 4) as 2 | 3 | 4);
  return (
    <div className="detail-card detail-panel">
      <h2 className="detail-panel__title">{title}</h2>
      <div className={`detail-panel__grid detail-panel__grid--${cols}`}>
        {items.map((item) => {
          const Icon = detailIcons[item.icon];
          return (
            <div className="detail-panel__item" key={item.title}>
              <Icon size={19} aria-hidden="true" />
              <div className="detail-panel__itemTitle">{item.title}</div>
              {item.body ? <div className="detail-panel__itemBody">{item.body}</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
