import type { PrototypeContent } from "./content/types";
import { loadPrototypes } from "./content/loaders";

export type ProjectSection = PrototypeContent["sections"][number];
export type Project = PrototypeContent;

export function getProjects(): Project[] {
  return loadPrototypes();
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
