"use client";

import { getSite } from "@/lib/site";

export function Hero() {
  const { hero, urls } = getSite();
  return (
    <div className="hero-frame">
      <div className="hero-card">
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-greeting fade-up d2">{hero.greeting}</div>
          <h1 className="hero-name fade-up d3">
            {hero.nameBeforeAccent}
            <span className="accent">{hero.nameAccent}</span>
          </h1>
          <p className="hero-intro fade-up d4">{hero.intro}</p>
          <div className="hero-cta fade-up d5">
            <a href={hero.primaryCta.href} className="btn btn-primary">
              {hero.primaryCta.label}
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 13l7 7 7-7" />
              </svg>
            </a>
            <a href={urls.resume} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
              {hero.secondaryCtaLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </a>
          </div>
        </div>

        <div className="hero-meta fade-up d6">
          {hero.meta.map((row) => (
            <div key={row.label} className="meta-item">
              <div className="label">{row.label}</div>
              <div className="value">{row.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
