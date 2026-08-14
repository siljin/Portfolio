"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * Supply either `diagramUrl` (renders an image) or `children` (renders live
 * JSX, used by the workflow diagram's fullscreen view). `children` wins when
 * both are present.
 */
type DiagramModalProps = {
  title: string;
  projectTitle: string;
  diagramUrl?: string;
  children?: ReactNode;
  onClose: () => void;
};

export function DiagramModal({
  title,
  projectTitle,
  diagramUrl,
  children,
  onClose,
}: DiagramModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="modalOverlay" role="presentation" onClick={onClose} />
      <div className={`modalContent${children ? " modalContent--wide" : ""}`}>
        <button type="button" className="modalClose" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="modalTitle">{title}</h2>
        {children ? (
          <div className="modalBodyContainer">{children}</div>
        ) : diagramUrl ? (
          <div className="modalImageContainer">
            <Image
              src={diagramUrl}
              alt={`${projectTitle} ${title.toLowerCase()}`}
              width={800}
              height={600}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
