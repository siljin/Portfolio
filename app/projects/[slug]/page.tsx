import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectSlugs, getProjects } from "@/lib/projects";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { ProjectCaseDetail } from "@/components/projects/ProjectCaseDetail";
import { getSite } from "@/lib/site";

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
    description: project.desc,
    // Canonical address for a case study. `/projects?id=…` redirects here
    // rather than serving the same content at a second URL.
    alternates: { canonical: `/projects/${project.slug}/` },
  };
}

export default async function ProjectCasePage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { projectsArchive, labels } = getSite();

  return (
    <ArchiveShell
      title={projectsArchive.sidebarTitle}
      items={getProjects().map((item) => ({
        id: item.id,
        title: item.title,
        href: `/projects/${item.slug}/`,
      }))}
      selectedId={project.id}
      listId="projects-sidebar-list"
    >
      <main className="projects-content application-detail-content project-detail-content">
        <Link href="/#projects" className="projectPageBack projectPageBack--archive">
          {labels.backToProjects}
        </Link>
        <ProjectCaseDetail project={project} />
      </main>
    </ArchiveShell>
  );
}
