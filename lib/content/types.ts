/** Type-only definitions for JSON under `content/`. Runtime checks live in `validate.ts` / `loaders.ts`. */

import type { AccentName, DetailIconName } from "@/components/detail/iconRegistry";

export type { AccentName, DetailIconName };

/**
 * Detail-page visual blocks. Each item in `detail.blocks[]` is one of these
 * discriminated shapes; the renderer in `components/detail/renderBlock.tsx`
 * switches on `kind` to pick the matching component. Adding a new block kind
 * = new entry here + new validator branch + new component.
 */
export type DetailBlock =
  | { kind: "lede"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "tagRow"; tags: string[] }
  | { kind: "previewPane"; image: string; url?: string; caption?: string; chrome?: "browser" | "none" }
  | { kind: "metaStrip"; cells: { label: string; value: string }[] }
  | { kind: "cta"; label: string; href: string; note?: string }
  | { kind: "columns"; ratio?: ColumnsRatio; items: DetailBlock[] }
  | { kind: "pageHero"; badge?: string; title: string; body?: string; cta?: { label: string; href: string } }
  | { kind: "statStrip"; cells: StatCell[] }
  | { kind: "featurePanel"; title: string; columns?: 2 | 3 | 4; items: FeatureItem[] }
  | {
      kind: "workflowDiagram";
      title: string;
      fullscreen?: boolean;
      inputs?: { label: string; items: { icon: DetailIconName; label: string }[] };
      nodes: WorkflowDiagramNode[];
      outputs: WorkflowOutput[];
      branches?: WorkflowBranch[];
      legend?: { style: "solid" | "dashed" | "gate" | "person"; label: string }[];
    };

export type ColumnsRatio = "1-1" | "1-2" | "1-3" | "2-1";

export type StatCell = { icon: DetailIconName; value: string; label: string };

export type FeatureItem = { icon: DetailIconName; title: string; body?: string };

/**
 * A diagram node is either a numbered pipeline `stage` or an unnumbered
 * `gate` — a decision point that can divert flow out of the pipeline.
 * `role` defaults to `"stage"`.
 */
export type WorkflowDiagramNode = {
  icon: DetailIconName;
  title: string;
  body?: string;
  accent: AccentName;
  role?: "stage" | "gate";
};

export type WorkflowOutput = {
  icon: DetailIconName;
  title: string;
  caption?: string;
  tone?: "success" | "warn" | "neutral";
};

/**
 * Connects a gate to an output it diverts to. `from` indexes `nodes`, `to`
 * indexes `outputs`. `validate.ts` range-checks both, requires `from` to point
 * at a `role: "gate"` node, and requires exactly one output to be left
 * unreferenced — that one is the pipeline's own terminus.
 *
 * A single gate may own several branches (a three-way route is one gate with
 * two branches plus the spine).
 */
export type WorkflowBranch = { from: number; to: number; label: string };

export type DetailContent = {
  blocks: DetailBlock[];
};

export type PrototypeSection = {
  title: string;
  paragraphs: string[];
  diagramSrc?: string;
};

export type PrototypeContent = {
  slug: string;
  id: string;
  eyebrow: string;
  title: string;
  descriptor: string;
  tag: string;
  category?: string;
  highlight?: string;
  metric: string;
  metricLabel: string;
  coverSrc: string;
  tryItUrl: string;
  iconPath: string;
  sections: PrototypeSection[];
  architectureDiagram?: string;
  sequenceDiagram?: string;
  detail?: DetailContent;
};

export type PortfolioSection = {
  title: string;
  paragraphs: string[];
};

export type PortfolioProjectContent = {
  /** Canonical URL segment: a case study lives at `/projects/<slug>/`. */
  slug: string;
  id: string;
  eyebrow: string;
  title: string;
  category: string;
  desc: string;
  metric1: string;
  metric1Label: string;
  metric2: string;
  metric2Label: string;
  tags: string[];
  deckUrl: string;
  sections?: PortfolioSection[];
  imageSrc?: string;
  detail?: DetailContent;
};

export type DemoContent = {
  slug: string;
  title: string;
  buildNote: string;
  href: string;
  coverSrc: string;
  tag?: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type HeroMetaRow = {
  label: string;
  value: string;
};

export type HomeSectionBlock = {
  eyebrow: string;
  titleBeforeEm: string;
  titleEmphasis: string;
  description: string;
};

export type ViewAllCard = {
  ariaLabel: string;
  title: string;
  description: string;
  buttonLabel: string;
};

export type ArchiveSidebarCopy = {
  sidebarTitle: string;
  sidebarSubtitle: string;
};

export type ProjectsArchiveCopy = ArchiveSidebarCopy & {
  emptyEyebrow: string;
  emptyTitle: string;
};

export type SiteLabels = {
  tryIt: string;
  tryItPrototypes: string;
  viewArchitecture: string;
  sequenceDiagram: string;
  architectureModalTitle: string;
  sequenceModalTitle: string;
  highlight: string;
  viewDeck: string;
  checkItOut: string;
  read: string;
  viewAll: string;
  collapseSidebar: string;
  expandSidebar: string;
  projectImagePlaceholder: string;
  backToPrototypes: string;
  backToProjects: string;
  projectsCarouselPrevious: string;
  projectsCarouselNext: string;
};

export type SiteContent = {
  identity: {
    fullName: string;
    logoDot: string;
    footerRole: string;
    footerDegree: string;
  };
  urls: {
    email: string;
    linkedIn: string;
  };
  seo: {
    defaultDescription: string;
  };
  metadata: {
    prototypeDetailTitleSeparator: string;
    fallbackProjectListTitle: string;
  };
  nav: {
    links: NavLink[];
    resumeLabel: string;
  };
  hero: {
    greeting: string;
    nameBeforeAccent: string;
    nameAccent: string;
    intro: {
      lead: string;
      highlight: string;
      tail: string;
      closing: string;
    };
    poem: {
      lines: [string, string, string, string];
      poet: string;
    };
    photoSrc?: string;
    photoCaption?: string;
    meta: HeroMetaRow[];
  };
  home: {
    prototypesSection: HomeSectionBlock;
    prototypesViewAll: ViewAllCard;
    projectsSection: HomeSectionBlock;
  };
  archive: {
    backToPortfolio: string;
  };
  prototypesArchive: ArchiveSidebarCopy;
  projectsArchive: ProjectsArchiveCopy;
  prototypesEmptyState: {
    eyebrow: string;
    title: string;
  };
  labels: SiteLabels;
  contact: {
    eyebrow: string;
    titleStart: string;
    titleEmphasis: string;
    linkedInButton: string;
  };
  footer: {
    tagline: string;
    year: string;
  };
  system: {
    loading: string;
    notFoundTitle: string;
    notFoundBody: string;
    notFoundCta: string;
  };
};
