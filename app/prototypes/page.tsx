"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProjects } from "@/lib/prototypes";
import { getSite } from "@/lib/site";

/**
 * `/prototypes` is not a page of its own — every prototype lives at its
 * own canonical `/prototypes/<slug>/`.
 *
 * This route exists only to forward the legacy `?id=` form used by older links
 * and to send a bare `/prototypes` to the first prototype. The redirect
 * runs on the client because the site is a static export, where no server
 * redirect is available.
 */
function PrototypesRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projects = getProjects();
  const queryId = searchParams.get("id");

  const target = queryId
    ? projects.find((project) => project.id === queryId)
    : projects[0];
  const slug = target?.slug ?? projects[0]?.slug;

  useEffect(() => {
    if (slug) router.replace(`/prototypes/${slug}/`);
  }, [router, slug]);

  return null;
}

export default function Page() {
  const loading = getSite().system.loading;
  return (
    <Suspense fallback={<div>{loading}</div>}>
      <PrototypesRedirect />
    </Suspense>
  );
}
