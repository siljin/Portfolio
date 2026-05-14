import type {
  ApplicationContent,
  PortfolioProjectContent,
  SiteContent,
} from "./types";
import {
  validateApplication,
  validateDemosJson,
  validatePortfolioProject,
  validateSite,
} from "./validate";
import applicationsJson from "@/content/applications/applications.json";
import projectsJson from "@/content/projects/projects.json";
import demosJson from "@/content/demos/demos.json";
import siteJson from "@/content/site/site.json";

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

function validateApplicationsArray(data: unknown): ApplicationContent[] {
  if (!Array.isArray(data)) {
    throw new Error("content/applications/applications.json: root must be an array");
  }
  data.forEach((item, i) => validateApplication(item, i));
  return data as ApplicationContent[];
}

function validatePortfolioArray(data: unknown): PortfolioProjectContent[] {
  if (!Array.isArray(data)) {
    throw new Error("content/projects/projects.json: root must be an array");
  }
  data.forEach((item, i) => validatePortfolioProject(item, i));
  return data as PortfolioProjectContent[];
}

export function loadApplications(): ApplicationContent[] {
  const data = validateApplicationsArray(applicationsJson);
  return withIntegrityChecks(data, "content/applications/applications.json");
}

export function loadPortfolioProjects(): PortfolioProjectContent[] {
  const data = validatePortfolioArray(projectsJson);
  return withIntegrityChecks(data, "content/projects/projects.json");
}

/** Validates `content/demos/demos.json` when this module loads (no UI surface yet). */
withIntegrityChecks(validateDemosJson(demosJson), "content/demos/demos.json");

export function loadSite(): SiteContent {
  validateSite(siteJson);
  return siteJson;
}
