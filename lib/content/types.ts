/** Type-only definitions for JSON under `content/`. Runtime checks live in `validate.ts` / `loaders.ts`. */

export type ApplicationSection = {
  title: string;
  paragraphs: string[];
  diagramSrc?: string;
};

export type ApplicationContent = {
  slug: string;
  id: string;
  eyebrow: string;
  title: string;
  descriptor: string;
  tag: string;
  category?: string;
  highlight?: string;
  coverSrc: string;
  tryItUrl: string;
  iconPath: string;
  sections: ApplicationSection[];
  architectureDiagram?: string;
  sequenceDiagram?: string;
};

export type PortfolioSection = {
  title: string;
  paragraphs: string[];
};

export type PortfolioProjectContent = {
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

export type HeroCta = {
  label: string;
  href: string;
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
  tryItApplications: string;
  viewArchitecture: string;
  sequenceDiagram: string;
  architectureModalTitle: string;
  sequenceModalTitle: string;
  highlight: string;
  viewDeck: string;
  read: string;
  viewAll: string;
  collapseSidebar: string;
  expandSidebar: string;
  projectImagePlaceholder: string;
  backToApplications: string;
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
    resume: string;
  };
  seo: {
    defaultDescription: string;
  };
  metadata: {
    applicationDetailTitleSeparator: string;
    fallbackProjectListTitle: string;
  };
  nav: {
    showStatus: boolean;
    statusText: string;
    links: NavLink[];
    resumeLabel: string;
  };
  hero: {
    greeting: string;
    nameBeforeAccent: string;
    nameAccent: string;
    intro: string;
    primaryCta: HeroCta;
    secondaryCtaLabel: string;
    meta: HeroMetaRow[];
  };
  home: {
    applicationsSection: HomeSectionBlock;
    applicationsViewAll: ViewAllCard;
    projectsSection: HomeSectionBlock;
    projectsViewAll: ViewAllCard;
  };
  archive: {
    backToPortfolio: string;
  };
  applicationsArchive: ArchiveSidebarCopy;
  projectsArchive: ProjectsArchiveCopy;
  applicationsEmptyState: {
    eyebrow: string;
    title: string;
  };
  labels: SiteLabels;
  contact: {
    eyebrow: string;
    titleStart: string;
    titleEmphasis: string;
    description: string;
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
