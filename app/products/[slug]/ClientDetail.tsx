"use client";

import Link from "next/link";
import { renderBlocks } from "@/components/detail/renderBlock";
import type { Product } from "@/lib/products";
import { getSite } from "@/lib/site";

/**
 * Product detail page.
 *
 * Content comes from `detail.blocks` in `content/products/products.json`, the
 * same block vocabulary the prototype pages use — so a product page is a JSON
 * edit, not a component. The one addition over a prototype page is the status
 * chip in the back rail, which is the point of this section: these are in real
 * use.
 */
export default function ClientDetail({ product }: { product: Product }) {
  const { labels } = getSite();
  const blocks = product.detail.blocks;

  return (
    <article className="projectPage projectPage--blocks">
      <div className="productPageRail">
        <Link href="/#products" className="projectPageBack">
          {labels.backToProducts}
        </Link>
        <span className={`status-chip status-chip--${product.status.tone}`}>
          <span aria-hidden="true" className="status-chip__dot" />
          {product.status.label}
        </span>
      </div>

      <div className="detail-blocks">{renderBlocks(blocks)}</div>
    </article>
  );
}
