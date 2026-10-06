import Link from "next/link";
import { listPublishedProjects } from "@/lib/projects-store";
import { getPortfolioContent } from "@/lib/portfolio-content-store";
import { buildPageMetadata } from "@/lib/seo";
import { buildHomepageStructuredData } from "@/lib/structured-data";

export async function generateMetadata() {
  const content = await getPortfolioContent();

  return buildPageMetadata({
    pathname: "/",
    title: `${content.personal.name} - ${content.personal.title}`,
    description: content.about.description,
  });
}

export default async function Home() {
  const publishedProjects = await listPublishedProjects();
  const content = await getPortfolioContent();
  const personal = content.personal;
  const about = content.about;
  const links = content.links;
  const activeSearches = content.activeSearches;
  const skills = content.skills;
  const homepageJsonLd = buildHomepageStructuredData(content);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: homepageJsonLd }}
      />
      <section className="hero hero-structured">
        <div className="hero-layout">
          <div className="hero-right">
            <div className="hero-avatar-wrapper">
              <div className="hero-avatar-border" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/profile-photo.jpeg"
                alt={`Photo de ${personal.name}`}
                className="hero-avatar-img"
                loading="eager"
                decoding="sync"
              />
            </div>
          </div>
          <div className="hero-left">
            <span className="hero-kicker">{personal.title}</span>
            <h1>{personal.name}</h1>
            <p className="hero-subtitle">{personal.subtitle}</p>
            <p className="hero-description">{about.description}</p>
            <div className="hero-actions">
              <a href={links.cvUrl} target="_blank" rel="noopener noreferrer" className="btn primary">
                Voir mon CV
              </a>
              <Link href="/projects" className="btn secondary">
                Voir mes projets
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Recherche active</h2>
        {activeSearches.length === 0 ? (
          <article className="card">
            <p>Aucune recherche active affichée pour le moment.</p>
          </article>
        ) : (
          <div className="grid grid-3">
            {activeSearches.map((search, index) => (
              <article className="card" key={`${search.title}-${index}`}>
                <h3>{search.title}</h3>
                {search.status ? <p>Statut: {search.status}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>À propos</h2>
        <p>{about.description}</p>
      </section>

      <section className="section">
        <h2>Mes compétences</h2>
        {skills.length === 0 ? (
          <article className="card">
            <p>Aucune compétence renseignée pour le moment.</p>
          </article>
        ) : (
          <div className="grid grid-3">
            {skills.map((skill, index) => (
              <article className="card" key={`${skill.name}-${index}`}>
                <h3>{skill.name}</h3>
                {skill.level ? <p>{skill.level}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Statistiques</h2>
        <div className="grid grid-3">
          <article className="card">
            <h3>Projets</h3>
            <p>{publishedProjects.length}</p>
          </article>
          <article className="card">
            <h3>Années d&apos;expérience</h3>
            <p>2+</p>
          </article>
          <article className="card">
            <h3>Technologies</h3>
            <p>{skills.length > 0 ? `${skills.length}+` : "10+"}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>Contact</h2>
        <p>Intéressé par une collaboration ? N&apos;hésitez pas à me contacter !</p>
        <div className="cta-row">
          <Link href="/contact" className="btn">
            Me contacter
          </Link>
          <a href={`mailto:${links.email}`} className="btn secondary">
            Envoyer un email
          </a>
        </div>
      </section>

      <section className="section" style={{ textAlign: "center" }}>
        <h2>Partager ce portfolio</h2>
        <div className="cta-row" style={{ justifyContent: "center" }}>
          {links.linkedin ? (
            <a href={links.linkedin} className="btn" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          ) : (
            <span className="btn" aria-disabled="true">
              LinkedIn
            </span>
          )}
          <a
            href={`mailto:?subject=${encodeURIComponent("Portfolio - Nema Elisee Kourouma")}&body=${encodeURIComponent("Bonjour, voici mon portfolio : " + siteUrl)}`}
            className="btn secondary"
          >
            Email
          </a>
        </div>
      </section>
    </>
  );
}
