import type {
  PrototypeContent,
  ProductContent,
  PortfolioProjectContent,
  SiteContent,
} from "./types";
import {
  validatePrototype,
  validateProduct,
  validateDemosJson,
  validatePortfolioProject,
  validateSite,
} from "./validate";
import prototypesJson from "@/content/prototypes/prototypes.json";
import productsJson from "@/content/products/products.json";
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

function validatePrototypesArray(data: unknown): PrototypeContent[] {
  if (!Array.isArray(data)) {
    throw new Error("content/prototypes/prototypes.json: root must be an array");
  }
  data.forEach((item, i) => validatePrototype(item, i));
  return data as PrototypeContent[];
}

function validateProductsArray(data: unknown): ProductContent[] {
  if (!Array.isArray(data)) {
    throw new Error("content/products/products.json: root must be an array");
  }
  data.forEach((item, i) => validateProduct(item, i));
  return data as ProductContent[];
}

function validatePortfolioArray(data: unknown): PortfolioProjectContent[] {
  if (!Array.isArray(data)) {
    throw new Error("content/projects/projects.json: root must be an array");
  }
  data.forEach((item, i) => validatePortfolioProject(item, i));
  return data as PortfolioProjectContent[];
}

export function loadPrototypes(): PrototypeContent[] {
  const data = validatePrototypesArray(prototypesJson);
  return withIntegrityChecks(data, "content/prototypes/prototypes.json");
}

export function loadProducts(): ProductContent[] {
  const data = validateProductsArray(productsJson);
  return withIntegrityChecks(data, "content/products/products.json");
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
