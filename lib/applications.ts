import type { ApplicationContent } from "./content/schemas";
import { loadApplications } from "./content/loaders";

export type ProjectSection = ApplicationContent["sections"][number];
export type Project = ApplicationContent;

export function getProjects(): Project[] {
  return loadApplications();
}

export function getProjectSlugs(): string[] {
  return getProjects().map((p) => p.slug);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
