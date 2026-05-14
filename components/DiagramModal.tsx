"use client";

import Image from "next/image";
import { useEffect } from "react";

type DiagramModalProps = {
  title: string;
  projectTitle: string;
  diagramUrl: string;
  onClose: () => void;
};

export function DiagramModal({
  title,
  projectTitle,
  diagramUrl,
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
      <div className="modalContent">
        <button type="button" className="modalClose" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="modalTitle">{title}</h2>
        <div className="modalImageContainer">
          <Image
            src={diagramUrl}
            alt={`${projectTitle} ${title.toLowerCase()}`}
            width={800}
            height={600}
          />
        </div>
      </div>
    </>
  );
}
