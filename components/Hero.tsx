"use client";

import { resume_url, heroParagraph } from "@/lib/global-variables";

export function Hero() {
  return (
    <div className="hero-frame">
      <div className="hero-card">
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-eyebrow fade-up d2">
            <span className="pulse"></span>
            Available
          </div>
          <div className="hero-greeting fade-up d2">Hi, I&apos;m</div>
          <h1 className="hero-name fade-up d3">
            Siljin <span className="accent">Sebastian.</span>
          </h1>
          <p className="hero-intro fade-up d4">
            {heroParagraph}
          </p>
          <div className="hero-cta fade-up d5">
            <a href="#applications" className="btn btn-primary">
              View My Work
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 13l7 7 7-7" />
              </svg>
            </a>
            <a href={resume_url} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
              View Resume
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </a>
          </div>
        </div>

        <div className="hero-meta fade-up d6">
          <div className="meta-item">
            <div className="label">Based in</div>
            <div className="value">Austin, Texas</div>
          </div>
          <div className="meta-item">
            <div className="label">Background</div>
            <div className="value">Computer Engineer → MBA</div>
          </div>
          <div className="meta-item">
            <div className="label">Focus</div>
            <div className="value">Strategy, Product-led growth, AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
