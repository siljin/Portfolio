import type { PortfolioProjectContent } from "./content/types";
import { loadPortfolioProjects } from "./content/loaders";

export type ProjectSection = NonNullable<
  PortfolioProjectContent["sections"]
>[number];
export type Project = PortfolioProjectContent;

export function getProjects(): Project[] {
  return loadPortfolioProjects();
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}
