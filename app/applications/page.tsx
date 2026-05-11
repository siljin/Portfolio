"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getProjects } from "@/lib/applications";
import { ApplicationsNav } from "@/components/applications/ApplicationsNav";
import { ApplicationsSidebar } from "@/components/applications/ApplicationsSidebar";
import { ApplicationDetailPanel } from "@/components/applications/ApplicationDetailPanel";

function ProjectsContent() {
  const projects = getProjects();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState(queryId || projects[0]?.id || "");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showArchModal, setShowArchModal] = useState(false);
  const [showSeqModal, setShowSeqModal] = useState(false);

  useEffect(() => {
    if (queryId) {
      setSelectedId(queryId);
    }
  }, [queryId]);

  const selectedProject = projects.find((p) => p.id === selectedId);

  return (
    <>
      <ApplicationsNav />

      <div
        className={`projects-layout-wrapper applications-layout ${
          isSidebarExpanded ? "is-expanded" : ""
        }`}
      >
        <ApplicationsSidebar
          projects={projects}
          selectedId={selectedId}
          isExpanded={isSidebarExpanded}
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
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
