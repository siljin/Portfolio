import { detailIcons } from "@/components/detail/iconRegistry";
import type { StatCell } from "@/lib/content/types";

/**
 * A row of icon + value + label cells. The icon-bearing sibling of
 * `metaStrip`, which stays in use for prototypes that have not migrated.
 */
export function StatStripBlock({ cells }: { cells: StatCell[] }) {
  return (
    <div className="detail-stats">
      {cells.map((cell) => {
        const Icon = detailIcons[cell.icon];
        return (
          <div className="detail-stats__cell" key={`${cell.label}-${cell.value}`}>
            <span className="detail-stats__icon">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="detail-stats__text">
              <span className="detail-stats__value">{cell.value}</span>
              <span className="detail-stats__label">{cell.label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
