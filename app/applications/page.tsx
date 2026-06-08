"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProjects } from "@/lib/applications";
import { ArchiveSidebar } from "@/components/archive/ArchiveSidebar";
import { ApplicationDetailPanel } from "@/components/applications/ApplicationDetailPanel";
import { getCompactApplicationTitle } from "@/lib/content/display";
import { getSite } from "@/lib/site";

function ProjectsContent() {
  const projects = getProjects();
  const { applicationsArchive } = getSite();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState(queryId || projects[0]?.id || "");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showArchModal, setShowArchModal] = useState(false);
  const [showSeqModal, setShowSeqModal] = useState(false);

  useEffect(() => {
    if (queryId) {
      setSelectedId(queryId);
    }
  }, [queryId]);

  const selectedProject = projects.find((p) => p.id === selectedId);

  return (
    <div
      className={`projects-layout-wrapper applications-layout ${
        isSidebarExpanded ? "is-expanded" : ""
      }`}
    >
      <ArchiveSidebar
        title={applicationsArchive.sidebarTitle}
        items={projects.map((project) => ({
          id: project.id,
          title: getCompactApplicationTitle(project.title),
        }))}
        selectedId={selectedId}
        isExpanded={isSidebarExpanded}
        listId="applications-sidebar-list"
        onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
        onSelect={(id) => {
          setSelectedId(id);
          setShowArchModal(false);
          setShowSeqModal(false);
        }}
      />
      <ApplicationDetailPanel
        project={selectedProject}
        showArchModal={showArchModal}
        showSeqModal={showSeqModal}
        onOpenArchitecture={() => setShowArchModal(true)}
        onOpenSequence={() => setShowSeqModal(true)}
        onCloseArchitecture={() => setShowArchModal(false)}
        onCloseSequence={() => setShowSeqModal(false)}
      />
    </div>
  );
}

export default function Page() {
  const loading = getSite().system.loading;
  return (
    <Suspense fallback={<div>{loading}</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
