"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getSite } from "@/lib/site";

const CHAR_SPEED_MS = 36;
const LINE_PAUSE_MS = 480;
const FLIP_DELAY_MS = 500;

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Hero() {
  const { hero, identity } = getSite();
  const initials = initialsOf(identity.fullName);

  const [flipped, setFlipped] = useState(false);
  const [typed, setTyped] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState<number>(-1);
  const [showPoet, setShowPoet] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!flipped || startedRef.current) return;
    startedRef.current = true;

    const lines = hero.poem.lines;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const typeLine = (lineIdx: number) => {
      if (lineIdx >= lines.length) {
        setActiveLine(-1);
        const t = setTimeout(() => setShowPoet(true), LINE_PAUSE_MS);
        timeouts.push(t);
        return;
      }
      const text = lines[lineIdx];
      let charIdx = 0;
      setTyped((prev) => [...prev, ""]);
      setActiveLine(lineIdx);

      const interval = setInterval(() => {
        charIdx++;
        setTyped((prev) => {
          const next = [...prev];
          next[lineIdx] = text.slice(0, charIdx);
          return next;
        });
        if (charIdx >= text.length) {
          clearInterval(interval);
          const next = setTimeout(() => typeLine(lineIdx + 1), LINE_PAUSE_MS);
          timeouts.push(next);
        }
      }, CHAR_SPEED_MS);
      intervals.push(interval);
    };

    const initial = setTimeout(() => typeLine(0), FLIP_DELAY_MS);
    timeouts.push(initial);

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [flipped, hero.poem.lines]);

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
          <div className="hero-intro-stack">
            <p className="hero-intro fade-up d4">{hero.intro.lead}</p>
            <p className="hero-intro hero-intro--highlight fade-up d5">{hero.intro.highlight}</p>
            <p className="hero-intro fade-up d6">{hero.intro.tail}</p>
            <p className="hero-intro hero-intro--closing fade-up d7">{hero.intro.closing}</p>
          </div>
        </div>

        <div className="hero-right fade-up d2">
          <button
            type="button"
            className={`photo-flip-wrap${flipped ? " flipped" : ""}`}
            onClick={() => setFlipped((f) => !f)}
            aria-pressed={flipped}
            aria-label={flipped ? "Show photo" : "Read a poem"}
          >
            <div className="photo-flip-inner">
              <div className="photo-front">
                {hero.photoSrc ? (
                  <Image
                    src={hero.photoSrc}
                    alt={`Portrait of ${identity.fullName}`}
                    fill
                    sizes="280px"
                    className="photo-img"
                    priority
                  />
                ) : (
                  <div className="photo-avatar" aria-hidden="true">
                    <span className="photo-initials">{initials}</span>
                  </div>
                )}
                <div className="flip-hint">tap to read something beautiful ↩</div>
              </div>
              <div className="photo-back">
                <div className="poem-mark" aria-hidden="true">&ldquo;</div>
                <div className="poem-lines">
                  {typed.map((text, i) => (
                    <div key={i} className="poem-line">
                      {text}
                      {i === activeLine && <span className="poem-cursor" aria-hidden="true" />}
                    </div>
                  ))}
                </div>
                {showPoet && <div className="poem-poet">— {hero.poem.poet}</div>}
              </div>
            </div>
          </button>
          {hero.photoCaption && (
            <p className="photo-caption">{hero.photoCaption}</p>
          )}
        </div>

        <div className="hero-meta fade-up d9">
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
