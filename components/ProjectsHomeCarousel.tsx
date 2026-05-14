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

const SCROLL_LOCK_FALLBACK_MS = 450;
const MIN_CARD_WIDTH = 200;
const GAP_FALLBACK = 34;
/** Matches `.project-card--home-strip:hover { transform: scale(1.02) }`. */
const HOVER_SCALE = 1.02;

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

function slotsForViewport(innerWidth: number): number {
  if (innerWidth < 640) return 1;
  if (innerWidth < 1024) return 2;
  return 3;
}

/** scrollLeft that would align cardEl's left to the scrollport's inner-left (inside padding). */
function targetScrollLeftToAlignCard(
  scrollEl: HTMLElement,
  cardEl: HTMLElement,
  padLeftPx: number,
): number {
  const scrollRect = scrollEl.getBoundingClientRect();
  const cardRect = cardEl.getBoundingClientRect();
  const delta = cardRect.left - (scrollRect.left + padLeftPx);
  return Math.round(scrollEl.scrollLeft + delta);
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
  const pageTargetsRef = useRef<number[]>([]);
  const pendingPageRef = useRef<{
    pageIndex: number;
    direction: -1 | 1;
  } | null>(null);
  const scrollLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [slots, setSlots] = useState<number>(3);
  const [cardWidthPx, setCardWidthPx] = useState<number | null>(null);
  const [trackPadEndPx, setTrackPadEndPx] = useState<number>(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const N = cases.length;
  const pageCount = Math.max(1, Math.ceil(N / Math.max(1, slots)));
  const lastPageIndex = pageCount - 1;

  const clearScrollLockTimer = useCallback(() => {
    if (scrollLockTimerRef.current != null) {
      clearTimeout(scrollLockTimerRef.current);
      scrollLockTimerRef.current = null;
    }
  }, []);

  const currentPageIndex = useCallback((): number => {
    const el = scrollRef.current;
    const targets = pageTargetsRef.current;
    if (!el || targets.length === 0) return 0;
    const x = el.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < targets.length; i++) {
      const d = Math.abs(targets[i] - x);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  }, []);

  const syncButtons = useCallback(() => {
    const k = currentPageIndex();
    setCanPrev(k > 0);
    setCanNext(k < lastPageIndex);
  }, [currentPageIndex, lastPageIndex]);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const inner = typeof window !== "undefined" ? window.innerWidth : 1024;
    const nextSlots = slotsForViewport(inner);

    const cs = getComputedStyle(el);
    const padLeftPx = parseFloat(cs.paddingLeft);
    const padRightPx = parseFloat(cs.paddingRight);
    const padX = padLeftPx + padRightPx;

    const track = trackRef.current;
    const trackStyle = track ? getComputedStyle(track) : null;
    const gapPx = trackStyle
      ? parseFloat(trackStyle.columnGap || trackStyle.gap || "") ||
        GAP_FALLBACK
      : GAP_FALLBACK;
    // The track's negative margin-left pulls cards into the scroll element's
    // padding-left, so the leftmost card sits at x = padLeft + trackMarginLeft,
    // not at padLeft. Size cards so the rightmost visible card reaches the
    // scrollport's right edge while reserving room on its right for the hover
    // scale (center-origin scale(1.02) grows each side by 0.5% of cardWidth).
    const trackMarginLeftPx = trackStyle
      ? parseFloat(trackStyle.marginLeft)
      : 0;
    const trackOffsetLeft = padLeftPx + trackMarginLeftPx;
    const visibleWidth = Math.max(0, el.clientWidth - trackOffsetLeft);
    const gutter = (nextSlots - 1) * gapPx;
    const hoverGrowthPerSide = (HOVER_SCALE - 1) / 2;
    const nextCardW = Math.max(
      MIN_CARD_WIDTH,
      Math.floor(
        (visibleWidth - gutter) / (nextSlots + hoverGrowthPerSide),
      ),
    );

    // Trailing pad so the last (possibly short) page is reachable as left-aligned.
    const nextPageCount = Math.max(1, Math.ceil(N / nextSlots));
    const lastPageStart = (nextPageCount - 1) * nextSlots;
    const lastPageCount = Math.max(1, N - lastPageStart);
    const lastPageWidth =
      lastPageCount * nextCardW + Math.max(0, lastPageCount - 1) * gapPx;
    const scrollportInnerW = Math.max(0, el.clientWidth - padX);
    const padEnd = Math.max(0, scrollportInnerW - lastPageWidth);

    setSlots(nextSlots);
    setCardWidthPx(nextCardW);
    setTrackPadEndPx(padEnd);
  }, [N]);

  const recomputePageTargets = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) {
      pageTargetsRef.current = [];
      return;
    }
    const cards = (Array.from(track.children) as HTMLElement[]).slice(0, N);
    if (cards.length === 0) {
      pageTargetsRef.current = [];
      return;
    }
    const padLeft = parseFloat(getComputedStyle(el).paddingLeft);
    const count = Math.max(
      1,
      Math.ceil(cards.length / Math.max(1, slots)),
    );
    const targets: number[] = [];
    for (let k = 0; k < count; k++) {
      const idx = Math.min(cards.length - 1, k * slots);
      const t = targetScrollLeftToAlignCard(el, cards[idx], padLeft);
      targets.push(Math.max(0, t));
    }
    pageTargetsRef.current = targets;
  }, [N, slots]);

  const applyScrollLock = useCallback(() => {
    const el = scrollRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const cards = (Array.from(track.children) as HTMLElement[]).slice(0, N);
    if (cards.length === 0) return;
    const padLeft = parseFloat(getComputedStyle(el).paddingLeft);

    const pending = pendingPageRef.current;
    const k = pending ? pending.pageIndex : currentPageIndex();
    const startIdx = Math.min(cards.length - 1, k * slots);
    const card = cards[startIdx];
    if (!card) {
      pendingPageRef.current = null;
      clearScrollLockTimer();
      return;
    }
    const target = Math.max(
      0,
      targetScrollLeftToAlignCard(el, card, padLeft),
    );
    el.scrollLeft =
      pending?.direction === 1 ? Math.ceil(target) : Math.floor(target);

    pendingPageRef.current = null;
    clearScrollLockTimer();
    syncButtons();
  }, [N, clearScrollLockTimer, currentPageIndex, slots, syncButtons]);

  // Phase 1: measure on mount and when card count changes.
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  // Phase 2: after layout (new card width, pad, slot count) commits, recompute
  // page targets from real DOM rects, snap to the nearest valid page, sync buttons.
  useLayoutEffect(() => {
    if (cardWidthPx == null) return;
    recomputePageTargets();
    applyScrollLock();
    syncButtons();
  }, [
    cardWidthPx,
    trackPadEndPx,
    slots,
    N,
    applyScrollLock,
    recomputePageTargets,
    syncButtons,
  ]);

  // Event wiring: resize, scroll, scrollend.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    el.addEventListener("scroll", syncButtons, { passive: true });
    el.addEventListener("scrollend", applyScrollLock);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      el.removeEventListener("scroll", syncButtons);
      el.removeEventListener("scrollend", applyScrollLock);
      clearScrollLockTimer();
    };
  }, [applyScrollLock, clearScrollLockTimer, measure, syncButtons]);

  const scrollByPage = useCallback(
    (direction: -1 | 1) => {
      const el = scrollRef.current;
      const targets = pageTargetsRef.current;
      if (!el || targets.length === 0) return;
      const k = currentPageIndex();
      const next = Math.max(0, Math.min(lastPageIndex, k + direction));
      if (next === k) return;
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      pendingPageRef.current = { pageIndex: next, direction };
      clearScrollLockTimer();
      el.scrollTo({
        left: targets[next],
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
    [
      applyScrollLock,
      clearScrollLockTimer,
      currentPageIndex,
      lastPageIndex,
    ],
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
          {trackPadEndPx > 0 ? (
            <div
              className="projects-home__spacer"
              aria-hidden="true"
              style={{ width: `${trackPadEndPx}px` }}
            />
          ) : null}
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
