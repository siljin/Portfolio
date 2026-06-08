"use client";

import { Linkedin, Mail, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { getSite } from "@/lib/site";

export type ArchiveSidebarItem = {
  id: string;
  title: string;
};

type ArchiveSidebarProps = {
  title: string;
  items: ArchiveSidebarItem[];
  selectedId: string;
  isExpanded: boolean;
  listId: string;
  onToggleExpand: () => void;
  onSelect: (id: string) => void;
};

export function ArchiveSidebar({
  title,
  items,
  selectedId,
  isExpanded,
  listId,
  onToggleExpand,
  onSelect,
}: ArchiveSidebarProps) {
  const { contact, labels, urls } = getSite();
  const ToggleIcon = isExpanded ? PanelLeftClose : PanelLeftOpen;

  return (
    <aside className="projects-sidebar archive-sidebar">
      <div className="projects-sidebar-header">
        <div className="archive-sidebar-heading-row">
          <h1 className="projects-sidebar-title">{title}</h1>
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggleExpand}
            aria-label={isExpanded ? labels.collapseSidebar : labels.expandSidebar}
            aria-expanded={isExpanded}
            aria-controls={listId}
          >
            <ToggleIcon size={17} strokeWidth={2} aria-hidden={true} />
          </button>
        </div>
      </div>

      <ul className="projects-list" id={listId}>
        {items.map((item, index) => (
          <li key={item.id} className="projects-item">
            <button
              type="button"
              className={`projects-btn ${selectedId === item.id ? "active" : ""}`}
              onClick={() => onSelect(item.id)}
              aria-label={item.title}
            >
              <span className="projects-btn-icon" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="projects-btn-tooltip" aria-hidden="true">
                {item.title}
              </span>
              <span className="projects-btn-copy">
                <span className="projects-btn-title">{item.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="archive-sidebar-footer">
        <a className="archive-sidebar-link" href={`mailto:${urls.email}`}>
          <Mail size={15} strokeWidth={2.1} aria-hidden={true} />
          <span className="archive-sidebar-link__label">{contact.eyebrow}</span>
          <span className="projects-btn-tooltip" aria-hidden="true">
            {contact.eyebrow}
          </span>
        </a>
        <a
          className="archive-sidebar-link"
          href={urls.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin size={15} strokeWidth={2.1} aria-hidden={true} />
          <span className="archive-sidebar-link__label">{contact.linkedInButton}</span>
          <span className="projects-btn-tooltip" aria-hidden="true">
            {contact.linkedInButton}
          </span>
        </a>
      </div>
    </aside>
  );
}
