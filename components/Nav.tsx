"use client";

import Link from "next/link";
import { getSite } from "@/lib/site";

function NavItem({ href, label }: { href: string; label: string }) {
  if (href.startsWith("#")) {
    return <a href={href}>{label}</a>;
  }
  return <Link href={href}>{label}</Link>;
}

export function Nav() {
  const { nav, urls, identity } = getSite();
  return (
    <nav>
      <div className="nav-inner">
        <Link href="/" className="logo">
          {identity.fullName}
          <span className="dot">{identity.logoDot}</span>
        </Link>
        <div className="nav-links">
          {nav.showStatus && (
            <span className="nav-status">
              <span className="pulse"></span>
              {nav.statusText}
            </span>
          )}
          {nav.links.map((link) => (
            <NavItem key={link.href + link.label} href={link.href} label={link.label} />
          ))}
          <a href={urls.resume} className="nav-resume" target="_blank" rel="noopener noreferrer">
            {nav.resumeLabel}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
