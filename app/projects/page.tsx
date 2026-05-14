"use client";

import { Suspense } from "react";
import { getProjects } from "@/lib/projects";
import { ProjectsCaseArchive } from "@/components/projects/ProjectsCaseArchive";
import { getSite } from "@/lib/site";

function ProjectsArchiveBody() {
  return <ProjectsCaseArchive cases={getProjects()} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>{getSite().system.loading}</div>}>
      <ProjectsArchiveBody />
    </Suspense>
  );
}
