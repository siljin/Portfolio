"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  /** Element to render. Defaults to "div". */
  as?: ElementType;
  className?: string;
  /** Optional entrance delay in milliseconds. */
  delay?: number;
};

/**
 * Reveals its children with a fade-and-rise the first time it scrolls into
 * view. Falls back to immediately visible when IntersectionObserver is
 * unavailable (SSR / older browsers). Motion is handled by the `.reveal` CSS
 * and disabled under prefers-reduced-motion.
 */
export function Reveal({ children, as = "div", className, delay }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const classes = ["reveal", shown ? "is-visible" : "", className]
    .filter(Boolean)
    .join(" ");

  return createElement(
    as,
    {
      ref,
      className: classes,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children,
  );
}
