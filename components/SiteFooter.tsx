import { full_name } from "@/lib/global-variables";

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <span>
          {full_name}<span className="sep">·</span>Software Engineer<span className="sep">·</span>MBA
        </span>
        <span>
          Built with intention<span className="sep">·</span>2026
        </span>
      </div>
    </footer>
  );
}
