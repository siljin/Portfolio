"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProjects } from "@/lib/applications";
import { getSite } from "@/lib/site";

/**
 * `/applications` is not a page of its own — every application lives at its
 * own canonical `/applications/<slug>/`.
 *
 * This route exists only to forward the legacy `?id=` form used by older links
 * and to send a bare `/applications` to the first application. The redirect
 * runs on the client because the site is a static export, where no server
 * redirect is available.
 */
function ApplicationsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projects = getProjects();
  const queryId = searchParams.get("id");

  const target = queryId
    ? projects.find((project) => project.id === queryId)
    : projects[0];
  const slug = target?.slug ?? projects[0]?.slug;

  useEffect(() => {
    if (slug) router.replace(`/applications/${slug}/`);
  }, [router, slug]);

  return null;
}

export default function Page() {
  const loading = getSite().system.loading;
  return (
    <Suspense fallback={<div>{loading}</div>}>
      <ApplicationsRedirect />
    </Suspense>
  );
}
