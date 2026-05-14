"use client";

import { Suspense } from "react";
import type { Project } from "@/lib/projects";
import { ProjectsCaseArchive } from "@/components/projects/ProjectsCaseArchive";
import { getSite } from "@/lib/site";

type ProjectsArchiveClientProps = {
  cases: Project[];
};

export function ProjectsArchiveClient({ cases }: ProjectsArchiveClientProps) {
  return (
    <Suspense fallback={<div>{getSite().system.loading}</div>}>
      <ProjectsCaseArchive cases={cases} />
    </Suspense>
  );
}
