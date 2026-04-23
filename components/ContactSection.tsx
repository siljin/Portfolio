import { email, linkedIn_url } from "@/lib/global-variables";

export function ContactSection() {
  return (
    <div className="container">
      <section className="contact-block" id="contact">
        <div className="contact-inner">
          <div className="contact-eyebrow">Contact</div>
          <h2 className="contact-title">
            Let&apos;s talk about <em>a role.</em>
          </h2>
          <p className="contact-desc">
            Open to PM roles at product-led growth companies. Happy to chat.
          </p>
          <div className="contact-actions">
            <a href={`mailto:${email}`} className="email-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {email}
            </a>
            <a
              href={linkedIn_url}
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
