import type {
  ApplicationContent,
  ApplicationSection,
  DemoContent,
  PortfolioProjectContent,
  PortfolioSection,
  SiteContent,
} from "./types";

const IMAGE_PREFIX = "/images/";

export function assertImagePath(
  value: string | undefined,
  field: string,
  context: string,
  optional: boolean
): void {
  if (optional && (value === undefined || value === "")) return;
  if (typeof value !== "string" || !value.startsWith(IMAGE_PREFIX)) {
    throw new Error(
      `${context}: ${field} must be a string starting with ${IMAGE_PREFIX}, got ${JSON.stringify(value)}`
    );
  }
}

function assertNonEmptyString(value: unknown, field: string, context: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${context}: ${field} must be a non-empty string`);
  }
}

function validateApplicationSection(
  s: unknown,
  index: number,
  appIndex: number
): asserts s is ApplicationSection {
  const ctx = `applications[${appIndex}].sections[${index}]`;
  if (typeof s !== "object" || s === null) throw new Error(`${ctx}: expected object`);
  const o = s as Record<string, unknown>;
  assertNonEmptyString(o.title, "title", ctx);
  if (!Array.isArray(o.paragraphs) || o.paragraphs.length === 0) {
    throw new Error(`${ctx}: paragraphs must be a non-empty array`);
  }
  for (let i = 0; i < o.paragraphs.length; i++) {
    assertNonEmptyString(o.paragraphs[i], `paragraphs[${i}]`, ctx);
  }
  if (o.diagramSrc !== undefined) {
    assertNonEmptyString(o.diagramSrc, "diagramSrc", ctx);
    assertImagePath(o.diagramSrc as string, "diagramSrc", ctx, false);
  }
}

export function validateApplication(item: unknown, index: number): asserts item is ApplicationContent {
  const ctx = `applications[${index}]`;
  if (typeof item !== "object" || item === null) throw new Error(`${ctx}: expected object`);
  const o = item as Record<string, unknown>;
  assertNonEmptyString(o.slug, "slug", ctx);
  assertNonEmptyString(o.id, "id", ctx);
  assertNonEmptyString(o.eyebrow, "eyebrow", ctx);
  assertNonEmptyString(o.title, "title", ctx);
  assertNonEmptyString(o.descriptor, "descriptor", ctx);
  assertNonEmptyString(o.tag, "tag", ctx);
  if (o.category !== undefined) assertNonEmptyString(o.category, "category", ctx);
  if (o.highlight !== undefined) assertNonEmptyString(o.highlight, "highlight", ctx);
  assertNonEmptyString(o.metric, "metric", ctx);
  assertNonEmptyString(o.metricLabel, "metricLabel", ctx);
  assertNonEmptyString(o.coverSrc, "coverSrc", ctx);
  assertImagePath(o.coverSrc as string, "coverSrc", ctx, false);
  assertNonEmptyString(o.tryItUrl, "tryItUrl", ctx);
  assertNonEmptyString(o.iconPath, "iconPath", ctx);
  if (!Array.isArray(o.sections) || o.sections.length === 0) {
    throw new Error(`${ctx}: sections must be a non-empty array`);
  }
  o.sections.forEach((sec, i) => validateApplicationSection(sec, i, index));
  if (o.architectureDiagram !== undefined) {
    assertNonEmptyString(o.architectureDiagram, "architectureDiagram", ctx);
    assertImagePath(o.architectureDiagram as string, "architectureDiagram", ctx, false);
  }
  if (o.sequenceDiagram !== undefined) {
    assertNonEmptyString(o.sequenceDiagram, "sequenceDiagram", ctx);
    assertImagePath(o.sequenceDiagram as string, "sequenceDiagram", ctx, false);
  }
}

export function validatePortfolioSection(
  s: unknown,
  index: number,
  projIndex: number
): asserts s is PortfolioSection {
  const ctx = `projects[${projIndex}].sections[${index}]`;
  if (typeof s !== "object" || s === null) throw new Error(`${ctx}: expected object`);
  const o = s as Record<string, unknown>;
  assertNonEmptyString(o.title, "title", ctx);
  if (!Array.isArray(o.paragraphs) || o.paragraphs.length === 0) {
    throw new Error(`${ctx}: paragraphs must be a non-empty array`);
  }
  for (let i = 0; i < o.paragraphs.length; i++) {
    assertNonEmptyString(o.paragraphs[i], `paragraphs[${i}]`, ctx);
  }
}

export function validatePortfolioProject(
  item: unknown,
  index: number
): asserts item is PortfolioProjectContent {
  const ctx = `projects[${index}]`;
  if (typeof item !== "object" || item === null) throw new Error(`${ctx}: expected object`);
  const o = item as Record<string, unknown>;
  assertNonEmptyString(o.id, "id", ctx);
  assertNonEmptyString(o.eyebrow, "eyebrow", ctx);
  assertNonEmptyString(o.title, "title", ctx);
  assertNonEmptyString(o.category, "category", ctx);
  assertNonEmptyString(o.desc, "desc", ctx);
  assertNonEmptyString(o.metric1, "metric1", ctx);
  assertNonEmptyString(o.metric1Label, "metric1Label", ctx);
  assertNonEmptyString(o.metric2, "metric2", ctx);
  assertNonEmptyString(o.metric2Label, "metric2Label", ctx);
  if (!Array.isArray(o.tags) || o.tags.length === 0) throw new Error(`${ctx}: tags must be a non-empty array`);
  o.tags.forEach((t, i) => assertNonEmptyString(t, `tags[${i}]`, ctx));
  assertNonEmptyString(o.deckUrl, "deckUrl", ctx);
  if (o.sections !== undefined) {
    if (!Array.isArray(o.sections)) throw new Error(`${ctx}: sections must be an array`);
    o.sections.forEach((sec, i) => validatePortfolioSection(sec, i, index));
  }
  if (o.imageSrc !== undefined && o.imageSrc !== "") {
    assertNonEmptyString(o.imageSrc, "imageSrc", ctx);
    assertImagePath(o.imageSrc as string, "imageSrc", ctx, false);
  }
}

export function validateDemo(item: unknown, index: number): asserts item is DemoContent {
  const ctx = `demos[${index}]`;
  if (typeof item !== "object" || item === null) throw new Error(`${ctx}: expected object`);
  const o = item as Record<string, unknown>;
  assertNonEmptyString(o.slug, "slug", ctx);
  assertNonEmptyString(o.title, "title", ctx);
  assertNonEmptyString(o.buildNote, "buildNote", ctx);
  assertNonEmptyString(o.href, "href", ctx);
  assertNonEmptyString(o.coverSrc, "coverSrc", ctx);
  assertImagePath(o.coverSrc as string, "coverSrc", ctx, false);
  if (o.tag !== undefined) assertNonEmptyString(o.tag, "tag", ctx);
}

export function validateDemosJson(data: unknown): DemoContent[] {
  if (!Array.isArray(data)) {
    throw new Error("content/demos/demos.json: root must be an array");
  }
  data.forEach((item, i) => validateDemo(item, i));
  return data as DemoContent[];
}

function assertSiteObject(o: unknown, path: string): asserts o is Record<string, unknown> {
  if (typeof o !== "object" || o === null) throw new Error(`${path}: expected object`);
}

export function validateSite(data: unknown): asserts data is SiteContent {
  if (typeof data !== "object" || data === null) throw new Error("site: root must be an object");
  const root = data as Record<string, unknown>;
  const ctx = "site";

  for (const key of [
    "identity",
    "urls",
    "seo",
    "metadata",
    "nav",
    "hero",
    "home",
    "archive",
    "applicationsArchive",
    "projectsArchive",
    "applicationsEmptyState",
    "labels",
    "contact",
    "footer",
    "system",
  ] as const) {
    if (!(key in root)) throw new Error(`${ctx}: missing "${key}"`);
    assertSiteObject(root[key], `${ctx}.${key}`);
  }

  const id = root.identity as Record<string, unknown>;
  assertNonEmptyString(id.fullName, "identity.fullName", ctx);
  assertNonEmptyString(id.logoDot, "identity.logoDot", ctx);
  assertNonEmptyString(id.footerRole, "identity.footerRole", ctx);
  assertNonEmptyString(id.footerDegree, "identity.footerDegree", ctx);

  const urls = root.urls as Record<string, unknown>;
  assertNonEmptyString(urls.email, "urls.email", ctx);
  assertNonEmptyString(urls.linkedIn, "urls.linkedIn", ctx);

  const seo = root.seo as Record<string, unknown>;
  assertNonEmptyString(seo.defaultDescription, "seo.defaultDescription", ctx);

  const meta = root.metadata as Record<string, unknown>;
  assertNonEmptyString(
    meta.applicationDetailTitleSeparator,
    "metadata.applicationDetailTitleSeparator",
    ctx
  );
  assertNonEmptyString(meta.fallbackProjectListTitle, "metadata.fallbackProjectListTitle", ctx);

  const nav = root.nav as Record<string, unknown>;
  if (!Array.isArray(nav.links) || nav.links.length === 0) throw new Error(`${ctx}.nav.links required`);
  nav.links.forEach((link, i) => {
    if (typeof link !== "object" || link === null) throw new Error(`${ctx}.nav.links[${i}]`);
    const l = link as Record<string, unknown>;
    assertNonEmptyString(l.label, `nav.links[${i}].label`, ctx);
    assertNonEmptyString(l.href, `nav.links[${i}].href`, ctx);
  });
  assertNonEmptyString(nav.resumeLabel, "nav.resumeLabel", ctx);

  const hero = root.hero as Record<string, unknown>;
  assertNonEmptyString(hero.greeting, "hero.greeting", ctx);
  assertNonEmptyString(hero.nameBeforeAccent, "hero.nameBeforeAccent", ctx);
  assertNonEmptyString(hero.nameAccent, "hero.nameAccent", ctx);
  if (typeof hero.intro !== "object" || hero.intro === null) throw new Error(`${ctx}.hero.intro`);
  const introBlock = hero.intro as Record<string, unknown>;
  assertNonEmptyString(introBlock.lead, "hero.intro.lead", ctx);
  assertNonEmptyString(introBlock.highlight, "hero.intro.highlight", ctx);
  assertNonEmptyString(introBlock.tail, "hero.intro.tail", ctx);
  assertNonEmptyString(introBlock.closing, "hero.intro.closing", ctx);

  if (typeof hero.poem !== "object" || hero.poem === null) throw new Error(`${ctx}.hero.poem`);
  const poem = hero.poem as Record<string, unknown>;
  assertNonEmptyString(poem.poet, "hero.poem.poet", ctx);
  if (!Array.isArray(poem.lines) || poem.lines.length !== 4) {
    throw new Error(`${ctx}.hero.poem.lines must be an array of exactly 4 strings`);
  }
  poem.lines.forEach((line, i) => {
    assertNonEmptyString(line, `hero.poem.lines[${i}]`, ctx);
  });

  if (hero.photoSrc !== undefined && typeof hero.photoSrc !== "string") {
    throw new Error(`${ctx}.hero.photoSrc must be a string when set`);
  }
  if (hero.photoCaption !== undefined && typeof hero.photoCaption !== "string") {
    throw new Error(`${ctx}.hero.photoCaption must be a string when set`);
  }
  if (!Array.isArray(hero.meta) || hero.meta.length === 0) throw new Error(`${ctx}.hero.meta`);
  hero.meta.forEach((row, i) => {
    if (typeof row !== "object" || row === null) throw new Error(`${ctx}.hero.meta[${i}]`);
    const r = row as Record<string, unknown>;
    assertNonEmptyString(r.label, `hero.meta[${i}].label`, ctx);
    assertNonEmptyString(r.value, `hero.meta[${i}].value`, ctx);
  });

  const home = root.home as Record<string, unknown>;
  for (const sectionKey of [
    "applicationsSection",
    "applicationsViewAll",
    "projectsSection",
  ]) {
    if (!(sectionKey in home)) throw new Error(`${ctx}.home.${sectionKey} missing`);
    const block = home[sectionKey] as Record<string, unknown>;
    if (sectionKey.endsWith("ViewAll")) {
      assertNonEmptyString(block.ariaLabel, `home.${sectionKey}.ariaLabel`, ctx);
      assertNonEmptyString(block.title, `home.${sectionKey}.title`, ctx);
      assertNonEmptyString(block.description, `home.${sectionKey}.description`, ctx);
      assertNonEmptyString(block.buttonLabel, `home.${sectionKey}.buttonLabel`, ctx);
    } else {
      assertNonEmptyString(block.eyebrow, `home.${sectionKey}.eyebrow`, ctx);
      assertNonEmptyString(block.titleBeforeEm, `home.${sectionKey}.titleBeforeEm`, ctx);
      assertNonEmptyString(block.titleEmphasis, `home.${sectionKey}.titleEmphasis`, ctx);
      assertNonEmptyString(block.description, `home.${sectionKey}.description`, ctx);
    }
  }

  const arch = root.archive as Record<string, unknown>;
  assertNonEmptyString(arch.backToPortfolio, "archive.backToPortfolio", ctx);

  for (const k of ["applicationsArchive", "projectsArchive"] as const) {
    const a = root[k] as Record<string, unknown>;
    assertNonEmptyString(a.sidebarTitle, `${k}.sidebarTitle`, ctx);
    assertNonEmptyString(a.sidebarSubtitle, `${k}.sidebarSubtitle`, ctx);
    if (k === "projectsArchive") {
      assertNonEmptyString(a.emptyEyebrow, `${k}.emptyEyebrow`, ctx);
      assertNonEmptyString(a.emptyTitle, `${k}.emptyTitle`, ctx);
    }
  }

  const aes = root.applicationsEmptyState as Record<string, unknown>;
  assertNonEmptyString(aes.eyebrow, "applicationsEmptyState.eyebrow", ctx);
  assertNonEmptyString(aes.title, "applicationsEmptyState.title", ctx);

  const labels = root.labels as Record<string, unknown>;
  const labelKeys: (keyof SiteContent["labels"])[] = [
    "tryIt",
    "tryItApplications",
    "viewArchitecture",
    "sequenceDiagram",
    "architectureModalTitle",
    "sequenceModalTitle",
    "highlight",
    "viewDeck",
    "checkItOut",
    "read",
    "viewAll",
    "collapseSidebar",
    "expandSidebar",
    "projectImagePlaceholder",
    "backToApplications",
    "projectsCarouselPrevious",
    "projectsCarouselNext",
  ];
  for (const lk of labelKeys) {
    assertNonEmptyString(labels[lk], `labels.${String(lk)}`, ctx);
  }

  const contact = root.contact as Record<string, unknown>;
  assertNonEmptyString(contact.eyebrow, "contact.eyebrow", ctx);
  assertNonEmptyString(contact.titleStart, "contact.titleStart", ctx);
  assertNonEmptyString(contact.titleEmphasis, "contact.titleEmphasis", ctx);
  assertNonEmptyString(contact.description, "contact.description", ctx);
  assertNonEmptyString(contact.linkedInButton, "contact.linkedInButton", ctx);

  const footer = root.footer as Record<string, unknown>;
  assertNonEmptyString(footer.tagline, "footer.tagline", ctx);
  assertNonEmptyString(footer.year, "footer.year", ctx);

  const system = root.system as Record<string, unknown>;
  assertNonEmptyString(system.loading, "system.loading", ctx);
  assertNonEmptyString(system.notFoundTitle, "system.notFoundTitle", ctx);
  assertNonEmptyString(system.notFoundBody, "system.notFoundBody", ctx);
  assertNonEmptyString(system.notFoundCta, "system.notFoundCta", ctx);
}
