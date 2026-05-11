import {
  applicationsSchema,
  demosSchema,
  portfolioProjectsSchema,
  type ApplicationContent,
  type DemoContent,
  type PortfolioProjectContent,
} from "./schemas";
import applicationsJson from "@/content/applications/applications.json";
import projectsJson from "@/content/projects/projects.json";
import demosJson from "@/content/demos/demos.json";

type WithIdentity = {
  id?: string;
  slug?: string;
};

function assertUnique<T extends WithIdentity>(
  items: T[],
  key: "id" | "slug",
  context: string
) {
  const seen = new Set<string>();
  for (const item of items) {
    const value = item[key];
    if (!value) continue;
    if (seen.has(value)) {
      throw new Error(`Duplicate ${key} "${value}" found in ${context}.`);
    }
    seen.add(value);
  }
}

function withIntegrityChecks<T extends WithIdentity>(
  items: T[],
  context: string
): T[] {
  assertUnique(items, "id", context);
  assertUnique(items, "slug", context);
  return items;
}

export function loadApplications(): ApplicationContent[] {
  const data = applicationsSchema.parse(applicationsJson);
  return withIntegrityChecks(data, "content/applications/applications.json");
}

export function loadPortfolioProjects(): PortfolioProjectContent[] {
  const data = portfolioProjectsSchema.parse(projectsJson);
  return withIntegrityChecks(data, "content/projects/projects.json");
}

export function loadDemos(): DemoContent[] {
  const data = demosSchema.parse(demosJson);
  return withIntegrityChecks(data, "content/demos/demos.json");
}
