import type { ProductContent } from "./content/types";
import { loadProducts } from "./content/loaders";

export type Product = ProductContent;

export function getProducts(): Product[] {
  return loadProducts();
}

export function getProductSlugs(): string[] {
  return getProducts().map((p) => p.slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}
