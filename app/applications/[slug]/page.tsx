import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectSlugs,
} from "@/lib/applications";
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
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return <ClientDetail project={project} />;
}
