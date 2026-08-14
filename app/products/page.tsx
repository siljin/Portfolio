"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/products";
import { getSite } from "@/lib/site";

/**
 * `/products` is not a page of its own — every product lives at its own
 * canonical `/products/<slug>/`.
 *
 * This route exists only to forward the `?id=` form and to send a bare
 * `/products` to the first product. The redirect runs on the client because the
 * site is a static export, where no server redirect is available.
 */
function ProductsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = getProducts();
  const queryId = searchParams.get("id");

  const target = queryId
    ? products.find((product) => product.id === queryId)
    : products[0];
  const slug = target?.slug ?? products[0]?.slug;

  useEffect(() => {
    if (slug) router.replace(`/products/${slug}/`);
  }, [router, slug]);

  return null;
}

export default function Page() {
  const loading = getSite().system.loading;
  return (
    <Suspense fallback={<div>{loading}</div>}>
      <ProductsRedirect />
    </Suspense>
  );
}
