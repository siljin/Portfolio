import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { full_name } from "@/lib/global-variables";
import {
  getProjectBySlug,
  getProjectSlugs,
  type Project,
} from "@/lib/applications";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return {
    title: `${project.title} — ${full_name}`,
    description: project.descriptor,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectDetail project={project} />;
}

function ProjectDetail({ project }: { project: Project }) {
  return (
    <article className="projectPage">
      <Link href="/#applications" className="projectPageBack">
        ← Back to applications
      </Link>
      <span className="projectPageTag mono">{project.tag}</span>
      <h1>{project.title}</h1>
      <p className="projectPageLead">{project.descriptor}</p>
      <Image
        className="projectPageImg"
        src={project.coverSrc}
        alt=""
        width={800}
        height={450}
        priority
      />
      {project.sections.map((s) => (
        <section key={s.title} className="projectPageSection">
          <h2>{s.title}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={`${s.title}-${i}`}>{p}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
