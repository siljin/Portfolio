"use client";

import Link from "next/link";
import { useState } from "react";
import { getProjects } from "@/lib/applications";

export default function ProjectsPage() {
  const projects = getProjects();
  const [selectedId, setSelectedId] = useState(projects[0]?.id || "");

  const selectedProject = projects.find((p) => p.id === selectedId);

  return (
    <>
      <nav className="archive-nav">
        <div className="nav-inner">
          <Link href="/" className="logo">
            Siljin Sebastian<span className="dot">.</span>
          </Link>
          <Link href="/" className="back-link">
            <svg
              className="arrow"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to portfolio
          </Link>
        </div>
      </nav>

      <div className="projects-layout-wrapper">
        {/* SIDEBAR */}
        <aside className="projects-sidebar">
          <div className="projects-sidebar-header">
            <h1 className="projects-sidebar-title">Projects</h1>
            <p className="projects-sidebar-subtitle">Select to explore</p>
          </div>
          <ul className="projects-list">
            {projects.map((project) => (
              <li key={project.id} className="projects-item">
                <button
                  className={`projects-btn ${
                    selectedId === project.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedId(project.id)}
                >
                  <span className="projects-btn-label">{project.eyebrow}</span>
                  <span className="projects-btn-title">{project.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* CONTENT */}
        <main className="projects-content">
          {selectedProject ? (
            <>
              <div className="projects-content-header">
                <div className="projects-content-eyebrow">
                  {selectedProject.eyebrow}
                </div>
                <h2 className="projects-content-title">
                  {selectedProject.title}
                </h2>
                {selectedProject.category && (
                  <div className="projects-content-category">
                    {selectedProject.category}
                  </div>
                )}
              </div>

              <p className="projects-content-desc">
                {selectedProject.descriptor}
              </p>

              {/* {selectedProject.highlight && (
                <div className="projects-content-highlight">
                  <div className="projects-highlight-label">Outcome</div>
                  <div className="projects-highlight-text">
                    {selectedProject.highlight}
                  </div>
                </div>
              )} */}

              <div className="projects-content-tags">
                {selectedProject.tag.split(" · ").map((tag) => (
                  <span key={tag} className="projects-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="projects-content-actions">
                {selectedProject.tryItUrl && (
                  <a
                    href={selectedProject.tryItUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="projects-try-btn"
                  >
                    Try it
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </a>
                )}
                <Link
                  href={`/applications/${selectedProject.slug}`}
                  className="projects-read-btn"
                >
                  Read case study
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="projects-content-header">
              <div className="projects-content-eyebrow">Select a project</div>
              <h2 className="projects-content-title">Choose from the list</h2>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
