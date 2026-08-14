import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectSlugs,
  getProjects,
} from "@/lib/applications";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { getCompactApplicationTitle } from "@/lib/content/display";
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
    title: `${project.title}${site.metadata.applicationDetailTitleSeparator}${site.identity.fullName}`,
    description: project.descriptor,
    // This is the canonical address for an application. `/applications?id=…`
    // redirects here rather than serving the same content at a second URL.
    alternates: { canonical: `/applications/${project.slug}/` },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { applicationsArchive } = getSite();

  return (
    <ArchiveShell
      title={applicationsArchive.sidebarTitle}
      items={getProjects().map((item) => ({
        id: item.id,
        title: getCompactApplicationTitle(item.title),
        href: `/applications/${item.slug}/`,
      }))}
      selectedId={project.id}
      listId="applications-sidebar-list"
    >
      <ClientDetail project={project} />
    </ArchiveShell>
  );
}
