import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectSlugs,
  getProjects,
} from "@/lib/applications";
import { ApplicationsArchiveShell } from "@/components/applications/ApplicationsArchiveShell";
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

  return (
    <ApplicationsArchiveShell projects={getProjects()} selectedId={project.id}>
      <ClientDetail project={project} />
    </ApplicationsArchiveShell>
  );
}
