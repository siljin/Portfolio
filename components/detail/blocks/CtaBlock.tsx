type CtaBlockProps = {
  label: string;
  href: string;
  note?: string;
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function CtaBlock({ label, href, note }: CtaBlockProps) {
  const external = isExternal(href);
  return (
    <div className="detail-block detail-cta">
      <a
        href={href}
        className="detail-cta__btn"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden={true}>
          {external ? <path d="M7 17L17 7M9 7h8v8" /> : <path d="M5 12h14M13 5l7 7-7 7" />}
        </svg>
      </a>
      {note && <span className="detail-cta__note">{note}</span>}
    </div>
  );
}
