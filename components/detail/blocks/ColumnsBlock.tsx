import type { ReactNode } from "react";
import type { ColumnsRatio, DetailBlock } from "@/lib/content/types";

/**
 * Recursive two-up container.
 *
 * Takes the render function as a prop rather than importing `renderBlock`
 * directly, because `renderBlock` imports this component — passing it in
 * breaks what would otherwise be an import cycle.
 */
export function ColumnsBlock({
  ratio = "1-1",
  items,
  render,
}: {
  ratio?: ColumnsRatio;
  items: DetailBlock[];
  render: (block: DetailBlock, key: number) => ReactNode;
}) {
  return (
    <div className={`detail-columns detail-columns--${ratio}`}>
      {items.map((item, i) => render(item, i))}
    </div>
  );
}
