import Link from "next/link";
import { getSite } from "@/lib/site";

export default function NotFound() {
  const { system } = getSite();
  return (
    <main className="section" style={{ paddingTop: 120, paddingBottom: 120 }}>
      <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", marginBottom: 12 }}>
        {system.notFoundTitle}
      </h1>
      <p className="projectPageLead" style={{ marginBottom: 24 }}>
        {system.notFoundBody}
      </p>
      <Link href="/" className="btn btnPrimary">
        {system.notFoundCta}
      </Link>
    </main>
  );
}
