import type { SiteContent } from "@/lib/content/types";
import { loadSite } from "./content/loaders";

/** Parsed site document; avoid re-reading JSON on every `getSite()` call in the client bundle. */
let cached: SiteContent | null = null;

export function getSite(): SiteContent {
  if (!cached) {
    cached = loadSite();
  }
  return cached;
}
