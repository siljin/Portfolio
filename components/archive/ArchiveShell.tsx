"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ArchiveSidebar } from "@/components/archive/ArchiveSidebar";
import type { ArchiveSidebarItem } from "@/components/archive/ArchiveSidebar";

/**
 * Sidebar + content frame shared by the prototype and case study archives.
 *
 * The sidebar renders real links, so every entry is deep-linkable and the
 * address bar always matches what is on screen. Only the collapse state is
 * local, which is why this is a client component; the content is passed in and
 * stays server-rendered.
 */
export function ArchiveShell({
  title,
  items,
  selectedId,
  listId,
  children,
}: {
  title: string;
  /** Each item carries its own `href`; see `ArchiveSidebarItem`. */
  items: ArchiveSidebarItem[];
  selectedId: string;
  listId: string;
  children: ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div
      className={`projects-layout-wrapper prototypes-layout ${
        isSidebarExpanded ? "is-expanded" : ""
      }`}
    >
      <ArchiveSidebar
        title={title}
        items={items}
        selectedId={selectedId}
        isExpanded={isSidebarExpanded}
        listId={listId}
        onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
      />
      {children}
    </div>
  );
}
