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
  const publishedDate = new Date(project.publishedAt).toLocaleDateString("fr-FR");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: projectJsonLd }}
      />
      <BackBar fallbackHref="/projects" />

      <section className="hero split-hero">
        <div className="hero-copy">
          <p className="hero-kicker">Case Study / {project.type}</p>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          <div className="stat-strip">
            <span>Publie le {publishedDate}</span>
            <span>{project.featured ? "Projet en vedette" : "Projet archive"}</span>
          </div>
        </div>

        {project.imageUrl ? (
          <div className="hero-portrait">
            <SafeProjectImage
              src={project.imageUrl}
              alt={`Image ${project.title}`}
              style={{ width: "100%", maxHeight: "360px", objectFit: "cover", borderRadius: "0.8rem" }}
            />
          </div>
        ) : (
          <div className="hero-portrait">
            <div className="portrait-frame portrait-placeholder">Projet</div>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Contexte et execution</h2>
          <p>Structure d&apos;intervention du besoin jusqu&apos;au resultat.</p>
        </div>
        <div className="case-grid">
          <article className="card case-section">
            <h3>Probleme</h3>
            <p>{project.summary}</p>
          </article>
          <article className="card case-section">
            <h3>Approche</h3>
            <p>
              Conception d&apos;une architecture orientee impact, avec priorite sur la
              fiabilite, la maintenabilite et le delai de livraison.
            </p>
          </article>
          <article className="card case-section">
            <h3>Resultat</h3>
            <p>
              Solution operationnelle livree, documentee et exploitable, avec une
              trajectoire claire pour les iterations suivantes.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Stack et ressources</h2>
          <p>Technologies utilisees et liens associes.</p>
        </div>
        <div className="chip-list">
          {project.stack.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>

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
