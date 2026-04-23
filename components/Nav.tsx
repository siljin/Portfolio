"use client";

import { resume_url } from "@/lib/global-variables";

export function Nav() {
  return (
    <nav>
      <div className="nav-inner">
        <a href="#" className="logo">
          Siljin Sebastian<span className="dot">.</span>
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <span className="nav-status">
            <span className="pulse"></span>
            Open to PM roles
          </span>
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href={resume_url} className="nav-resume" download>
            Resume
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
