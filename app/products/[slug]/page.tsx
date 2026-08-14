import { notFound } from "next/navigation";
import { getProductSlugs, getProducts } from "@/lib/products";
import { getResolvedProductBySlug } from "@/lib/products.server";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { getSite } from "@/lib/site";
import ClientDetail from "./ClientDetail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = getResolvedProductBySlug(slug);
  const site = getSite();
  if (!product) return { title: site.metadata.fallbackProjectListTitle };
  return {
    title: `${product.title}${site.metadata.productDetailTitleSeparator}${site.identity.fullName}`,
    description: product.descriptor,
    // Canonical address for a product; `/products?id=…` redirects here rather
    // than serving the same content at a second URL.
    alternates: { canonical: `/products/${product.slug}/` },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getResolvedProductBySlug(slug);
  if (!product) notFound();

  const { productsArchive } = getSite();

  return (
    <ArchiveShell
      title={productsArchive.sidebarTitle}
      items={getProducts().map((item) => ({
        id: item.id,
        title: item.title,
        href: `/products/${item.slug}/`,
      }))}
      selectedId={product.id}
      listId="products-sidebar-list"
    >
      <ClientDetail product={product} />
    </ArchiveShell>
  );
}
