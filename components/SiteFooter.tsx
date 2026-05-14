import { getSite } from "@/lib/site";

export function SiteFooter() {
  const { identity, footer } = getSite();
  return (
    <footer>
      <div className="footer-inner">
        <span>
          {identity.fullName}
          <span className="sep">·</span>
          {identity.footerRole}
          <span className="sep">·</span>
          {identity.footerDegree}
        </span>
        <span>
          {footer.tagline}
          <span className="sep">·</span>
          {footer.year}
        </span>
      </div>
    </footer>
  );
}
