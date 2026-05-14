"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const GAP_PX = 26;
const SCROLL_EPS = 2;
const SCROLL_LOCK_FALLBACK_MS = 450;
const DRIFT_RESET_PX = 4;
/** Slight under-measure of scrollport so ceil card widths fully cover the viewport (hides 4th-tile hairline). */
const VIEWPORT_TRIM_X = 3;

export type HomeProjectCase = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  metric: string;
  metricLabel: string;
  imageSrc?: string;
};

type ProjectsHomeCarouselProps = {
  cases: HomeProjectCase[];
  readLabel: string;
  imagePlaceholder: string;
  carouselPrevious: string;
  carouselNext: string;
};

/** Visible columns from viewport width (must match CSS intent). */
function slotsForViewport(innerWidth: number): number {
  if (innerWidth < 640) return 1;
  if (innerWidth < 1024) return 2;
  return 3;
}

export function ProjectsHomeCarousel({
  cases,
  readLabel,
  imagePlaceholder,
  carouselPrevious,
  carouselNext,
}: ProjectsHomeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef<{
    targetIndex: number;
    direction: -1 | 1;
  } | null>(null);
  const scrollLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [cardWidthPx, setCardWidthPx] = useState<number | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    setCanPrev(scrollLeft > SCROLL_EPS);
    setCanNext(scrollLeft + clientWidth < scrollWidth - SCROLL_EPS);
  }, []);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const inner =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    const slots = slotsForViewport(inner);
    const gutter = (slots - 1) * GAP_PX;
    const cs = getComputedStyle(el);
    const padX =
      parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const contentW = Math.max(
      0,
      el.clientWidth - padX - VIEWPORT_TRIM_X,
    );
    /* Ceil so slots*width + gutters >= contentW — avoids slack where the next tile peeks */
    const next = Math.max(200, Math.ceil((contentW - gutter) / slots));
    setCardWidthPx(next);
  }, []);

  const clearScrollLockTimer = useCallback(() => {
    if (scrollLockTimerRef.current != null) {
      clearTimeout(scrollLockTimerRef.current);
      scrollLockTimerRef.current = null;
    }
  }, []);

  const applyScrollLock = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    const p = pendingScrollRef.current;
    if (!el || !track || !p) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const card = cards[p.targetIndex];
    if (!card) {
      pendingScrollRef.current = null;
      clearScrollLockTimer();
      return;
    }
    const raw = card.offsetLeft;
    el.scrollLeft =
      p.direction === 1 ? Math.ceil(raw) : Math.floor(raw);
    pendingScrollRef.current = null;
    clearScrollLockTimer();
    syncScrollButtons();
  }, [clearScrollLockTimer, syncScrollButtons]);

  /** After layout changes, kill subpixel drift at the start of the strip. */
  const alignScrollAfterMeasure = useCallback(() => {
    const el = scrollRef.current;
    if (!el || pendingScrollRef.current) return;
    if (el.scrollLeft > 0 && el.scrollLeft < DRIFT_RESET_PX) {
      el.scrollLeft = 0;
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    requestAnimationFrame(() => {
      alignScrollAfterMeasure();
      syncScrollButtons();
    });
  }, [alignScrollAfterMeasure, cases.length, measure, syncScrollButtons]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      measure();
      requestAnimationFrame(() => {
        alignScrollAfterMeasure();
        syncScrollButtons();
      });
    });
    ro.observe(el);

    const onWin = () => {
      measure();
      requestAnimationFrame(() => {
        alignScrollAfterMeasure();
        syncScrollButtons();
      });
    };
    window.addEventListener("resize", onWin);
    el.addEventListener("scroll", syncScrollButtons, { passive: true });
    el.addEventListener("scrollend", applyScrollLock);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWin);
      el.removeEventListener("scroll", syncScrollButtons);
      el.removeEventListener("scrollend", applyScrollLock);
      clearScrollLockTimer();
    };
  }, [
    alignScrollAfterMeasure,
    applyScrollLock,
    clearScrollLockTimer,
    measure,
    syncScrollButtons,
  ]);

  const scrollByPage = useCallback(
    (direction: -1 | 1) => {
      const el = scrollRef.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const cards = Array.from(track.children) as HTMLElement[];
      if (cards.length === 0) return;

      const { scrollLeft } = el;
      let active = 0;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].offsetLeft <= scrollLeft + SCROLL_EPS) active = i;
      }

      const target = Math.max(
        0,
        Math.min(cards.length - 1, active + direction),
      );
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      pendingScrollRef.current = { targetIndex: target, direction };
      clearScrollLockTimer();
      el.scrollTo({
        left: cards[target].offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth",
      });
      if (reduceMotion) {
        applyScrollLock();
      } else {
        scrollLockTimerRef.current = setTimeout(() => {
          applyScrollLock();
        }, SCROLL_LOCK_FALLBACK_MS);
      }
    },
    [applyScrollLock, clearScrollLockTimer],
  );

  const scrollStyle =
    cardWidthPx != null
      ? ({ ["--projects-home-card-width"]: `${cardWidthPx}px` } as CSSProperties)
      : undefined;

  return (
    <div className="projects-home">
      <div
        className="projects-home__scroll"
        ref={scrollRef}
        style={scrollStyle}
      >
        <div className="projects-home__track" ref={trackRef}>
          {cases.map((c) => (
            <article
              key={c.id}
              className="project-card project-card--home-strip"
            >
              <div className="project-visual">
                {c.imageSrc ? (
                  <Image
                    src={c.imageSrc}
                    alt=""
                    width={800}
                    height={450}
                    sizes="280px"
                  />
                ) : (
                  <span className="placeholder">{imagePlaceholder}</span>
                )}
              </div>
              <div className="project-body">
                <div className="project-tags">
                  {c.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="project-title">{c.title}</h3>
                <p className="project-desc">{c.description}</p>
                <div className="project-footer">
                  <div className="metric">
                    <div className="metric-value">{c.metric}</div>
                    <div className="metric-label">{c.metricLabel}</div>
                  </div>
                  <a href={`/projects?id=${c.id}`} className="read-link">
                    {readLabel}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden={true}
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="projects-home__controls">
        <button
          type="button"
          className="projects-home__arrow"
          aria-label={carouselPrevious}
          disabled={!canPrev}
          onClick={() => scrollByPage(-1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          className="projects-home__arrow"
          aria-label={carouselNext}
          disabled={!canNext}
          onClick={() => scrollByPage(1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
