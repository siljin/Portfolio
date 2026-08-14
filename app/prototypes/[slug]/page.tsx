import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectSlugs,
  getProjects,
} from "@/lib/prototypes";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { getCompactPrototypeTitle } from "@/lib/content/display";
import { getSite } from "@/lib/site";
import ClientDetail from "./ClientDetail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  const site = getSite();
  if (!project) return { title: site.metadata.fallbackProjectListTitle };
  return {
    title: `${project.title}${site.metadata.prototypeDetailTitleSeparator}${site.identity.fullName}`,
    description: project.descriptor,
    // This is the canonical address for a prototype. `/prototypes?id=…`
    // redirects here rather than serving the same content at a second URL.
    alternates: { canonical: `/prototypes/${project.slug}/` },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { prototypesArchive } = getSite();

  return (
    <ArchiveShell
      title={prototypesArchive.sidebarTitle}
      items={getProjects().map((item) => ({
        id: item.id,
        title: getCompactPrototypeTitle(item.title),
        href: `/prototypes/${item.slug}/`,
      }))}
      selectedId={project.id}
      listId="prototypes-sidebar-list"
    >
      <ClientDetail project={project} />
    </ArchiveShell>
  );
}
