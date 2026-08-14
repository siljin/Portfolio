import { getAppConfig } from "./config";
import { getProductBySlug, getProducts, type Product } from "./products";
import type { DetailBlock } from "./content/types";

/**
 * Server-only resolution of the `${GAME_URL}` token in product content.
 *
 * This lives apart from `lib/products.ts` on purpose: `getAppConfig()` reads the
 * YAML with `node:fs`, and `app/products/page.tsx` is a client component that
 * imports the plain adapter. Keeping the config read here means the client
 * bundle never pulls in a Node built-in.
 *
 * Product JSON stores the token rather than the address, so the live URL is set
 * once in `config/application.yml` — or the `GAME_URL` env var — and every call
 * to action follows.
 */

const TOKEN = "${GAME_URL}";

function substitute(value: string, gameUrl: string) {
  return value.split(TOKEN).join(gameUrl);
}

function resolveBlock(block: DetailBlock, gameUrl: string): DetailBlock {
  if (block.kind === "cta") {
    return { ...block, href: substitute(block.href, gameUrl) };
  }
  if (block.kind === "pageHero" && block.cta) {
    return { ...block, cta: { ...block.cta, href: substitute(block.cta.href, gameUrl) } };
  }
  if (block.kind === "columns") {
    return { ...block, items: block.items.map((item) => resolveBlock(item, gameUrl)) };
  }
  return block;
}

function resolveProduct(product: Product, gameUrl: string): Product {
  return {
    ...product,
    tryItUrl: product.tryItUrl ? substitute(product.tryItUrl, gameUrl) : product.tryItUrl,
    detail: product.detail
      ? {
          ...product.detail,
          blocks: product.detail.blocks.map((block) => resolveBlock(block, gameUrl)),
        }
      : product.detail,
  };
}

export function getResolvedProducts(): Product[] {
  const gameUrl = getAppConfig().urls.game;
  return getProducts().map((product) => resolveProduct(product, gameUrl));
}

export function getResolvedProductBySlug(slug: string): Product | undefined {
  const product = getProductBySlug(slug);
  if (!product) return undefined;
  return resolveProduct(product, getAppConfig().urls.game);
}
