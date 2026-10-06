import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProjectBySlug } from "@/lib/projects-store";
import SafeProjectImage from "@/app/components/safe-project-image";
import ProjectDocumentAccess from "../project-document-access";
import BackBar from "@/app/components/back-bar";
import { buildPageMetadata } from "@/lib/seo";
import { getPortfolioContent } from "@/lib/portfolio-content-store";
import { buildProjectStructuredData } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    return buildPageMetadata({
      pathname: `/projects/${slug}`,
      title: "Projet introuvable",
      description: "Le projet demande n'existe pas ou n'est plus disponible.",
      noIndex: true,
    });
  }

  return buildPageMetadata({
    pathname: `/projects/${project.slug}`,
    title: `${project.title} - Projet`,
    description: project.summary,
    imagePath: project.imageUrl || "/images/profile-photo.jpeg",
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  const content = await getPortfolioContent();

  if (!project) {
    notFound();
  }

  const projectJsonLd = buildProjectStructuredData(
    project,
    content.personal.name,
    content.links.linkedin || undefined,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: projectJsonLd }}
      />
      <BackBar fallbackHref="/projects" />
      <section className="hero">
        <p>{project.type}</p>
        <h1>{project.title}</h1>
        {project.imageUrl ? (
          <div style={{ margin: "0.8rem 0" }}>
            <SafeProjectImage
              src={project.imageUrl}
              alt={`Image ${project.title}`}
              style={{ width: "100%", maxHeight: "360px", objectFit: "cover", borderRadius: "0.8rem" }}
            />
          </div>
        ) : null}
        <p>{project.summary}</p>
        <p>Publie le {project.publishedAt}</p>
      </section>

      <section className="section">
        <h2>Stack</h2>
        <p>{project.stack.join(" · ")}</p>
        <div className="cta-row">
          {project.liveUrl ? (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn primary">
              Voir la demo
            </a>
          ) : null}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn secondary"
            >
              Voir le code
            </a>
          ) : null}
          <ProjectDocumentAccess
            title={project.title}
            documentUrl={project.documentUrl}
            requiresAccessCode={project.requiresAccessCode}
          />
          <Link href="/projects" className="btn">
            Retour aux projets
          </Link>
        </div>
      </section>
    </>
  );
}
