import { full_name, email, linkedIn_url } from "@/lib/global-variables";

export function ContactSection() {
  return (
    <section id="contact">
      <h2 className="contact-title">
        Let&apos;s talk about
        <br />a role.
      </h2>
      <p className="contact-sub">
        Open to PM roles at product-led growth companies. Happy to chat.
      </p>
      <div className="contact-ctas">
        <a href={`mailto:${email}`} className="contact-cta-btn">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path
              d="M3 8l9 6 9-6M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {email}
        </a>
        <a
          href={linkedIn_url}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-cta-btn contact-cta-linkedin"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
          LinkedIn
        </a>
      </div>
      <div className="footer-bar">
        <span>{full_name} · Software Engineer · MBA</span>
        <span>Built with intention · 2026</span>
      </div>
    </section>
  );
}
