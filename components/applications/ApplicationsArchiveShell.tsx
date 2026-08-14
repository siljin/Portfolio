"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArchiveSidebar } from "@/components/archive/ArchiveSidebar";
import { getCompactApplicationTitle } from "@/lib/content/display";
import type { Project } from "@/lib/applications";
import { getSite } from "@/lib/site";

/**
 * Sidebar + content frame shared by every application page.
 *
 * The sidebar renders real links to `/applications/<slug>/`, so each entry is
 * deep-linkable and the address bar always matches what is on screen. Only the
 * collapse state is local, which is why this is a client component; the
 * content itself is passed in and stays server-rendered.
 */
export function ApplicationsArchiveShell({
  projects,
  selectedId,
  children,
}: {
  projects: Project[];
  selectedId: string;
  children: ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const { applicationsArchive } = getSite();

  const slugById = new Map(projects.map((project) => [project.id, project.slug]));

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
        hrefFor={(id) => `/applications/${slugById.get(id) ?? ""}/`}
      />
      {children}
    </div>
  );
}
