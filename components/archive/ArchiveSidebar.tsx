"use client";

import Link from "next/link";
import { Linkedin, Mail, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { getSite } from "@/lib/site";

/**
 * Give an item an `href` to render it as a real link to its own URL, or leave
 * it out and pass `onSelect` to swap content in place.
 *
 * The href is data rather than a `hrefFor` callback because these archives are
 * built by Server Components, and a function cannot cross that boundary.
 */
export type ArchiveSidebarItem = {
  id: string;
  title: string;
  href?: string;
};

type ArchiveSidebarProps = {
  title: string;
  items: ArchiveSidebarItem[];
  selectedId: string;
  isExpanded: boolean;
  listId: string;
  onToggleExpand: () => void;
  onSelect?: (id: string) => void;
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
        {items.map((item, index) => {
          const isActive = selectedId === item.id;
          const className = `projects-btn ${isActive ? "active" : ""}`;
          const inner = (
            <>
              <span className="projects-btn-icon" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="projects-btn-tooltip" aria-hidden="true">
                {item.title}
              </span>
              <span className="projects-btn-copy">
                <span className="projects-btn-title">{item.title}</span>
              </span>
            </>
          );

          return (
            <li key={item.id} className="projects-item">
              {item.href ? (
                <Link
                  href={item.href}
                  className={className}
                  aria-label={item.title}
                  aria-current={isActive ? "page" : undefined}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  className={className}
                  onClick={() => onSelect?.(item.id)}
                  aria-label={item.title}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
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
