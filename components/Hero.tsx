"use client";

import { resume_url } from "@/lib/global-variables";

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
            I started as an <strong>engineer</strong>, but the more I built, the more I cared about <em>who</em> I was building for and <em>why</em>. I went back to get my <strong>MBA</strong> to sharpen my product thinking, business strategy, and user intuition — with a clear aim to build things that meaningfully improve people&apos;s lives.
          </p>
          <div className="hero-cta fade-up d5">
            <a href="#work" className="btn btn-primary">
              View My Work
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <a href={resume_url} className="btn btn-ghost">
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
            <div className="value">Engineer → MBA → PM</div>
          </div>
          <div className="meta-item">
            <div className="label">Focus</div>
            <div className="value">Product-led growth, AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
