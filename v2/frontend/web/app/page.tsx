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
  const featuredProjects = publishedProjects.filter((project) => project.featured).slice(0, 3);
  const recentTimeline = content.timeline.slice(0, 4);
  const homepageJsonLd = buildHomepageStructuredData(content);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: homepageJsonLd }}
      />
      <section className="hero hero-structured split-hero">
        <div className="hero-copy">
          <p className="hero-kicker">{personal.title}</p>
          <h1>{personal.name}</h1>
          <p className="hero-subtitle">{personal.subtitle}</p>
          <p className="hero-description">{about.description}</p>
          <div className="hero-actions">
            <Link href="/projects" className="btn primary">
              Voir mes projets
            </Link>
            <a href={links.cvUrl} target="_blank" rel="noopener noreferrer" className="btn">
              CV
            </a>
            <Link href="/contact" className="btn secondary">
              Contact
            </Link>
          </div>
        </div>

        <div className="hero-portrait" aria-hidden="true">
          <div className="portrait-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personal.photo || "/images/profile-photo.jpeg"}
              alt=""
              className="portrait-image"
              loading="eager"
              decoding="sync"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Currently Building</h2>
          <p>Ce sur quoi je travaille maintenant, entre data, produit et automatisation.</p>
        </div>
        {activeSearches.length === 0 ? (
          <article className="card">
            <p>Aucune recherche active affichée pour le moment.</p>
          </article>
        ) : (
          <div className="grid grid-3">
            {activeSearches.map((search, index) => (
              <article className="card" key={`${search.title}-${index}`}>
                <h3>{search.title}</h3>
                <p>{search.status ? `Statut: ${search.status}` : "En cours de construction"}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Selected Work</h2>
          <p>Une selection des projets avec impact concret.</p>
        </div>
        <div className="grid grid-3">
          {(featuredProjects.length ? featuredProjects : publishedProjects.slice(0, 3)).map((project) => (
            <article className="card" key={project.slug}>
              <p className="muted">{project.type}</p>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <p className="muted">{project.stack.join(" / ")}</p>
              <div className="cta-row">
                <Link href={`/projects/${project.slug}`} className="btn">
                  Case study
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="stack">
        <div className="section-heading">
          <h2>Capabilities</h2>
          <p>Les briques techniques que j&apos;utilise pour livrer vite et propre.</p>
        </div>
        {skills.length === 0 ? (
          <article className="card">
            <p>Aucune compétence renseignée pour le moment.</p>
          </article>
        ) : (
          <div className="grid grid-3">
            {skills.slice(0, 9).map((skill, index) => (
              <article className="card" key={`${skill.name}-${index}`}>
                <h3>{skill.name}</h3>
                {skill.level ? <p>{skill.level}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Experience</h2>
          <p>Parcours, jalons et experiences structurantes.</p>
        </div>
        {recentTimeline.length === 0 ? (
          <article className="card">
            <p>Aucun element de parcours disponible.</p>
          </article>
        ) : (
          <div className="timeline-list">
            {recentTimeline.map((item, index) => (
              <article className="card" key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                {item.date ? <p className="muted">{item.date}</p> : null}
                {item.description ? <p>{item.description}</p> : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section two-col">
        <article className="card">
          <h2>About</h2>
          <p>{about.description}</p>
          <div className="stat-strip">
            <span>{publishedProjects.length} projets publies</span>
            <span>{skills.length || 10} technos</span>
            <span>{content.testimonials.length} temoignages</span>
          </div>
        </article>

        <article className="card">
          <h2>Contact</h2>
          <p>Disponible pour mission, collaboration produit ou execution technique.</p>
          <div className="cta-row">
            <Link href="/contact" className="btn primary">
              Demarrer une discussion
            </Link>
            <a href={`mailto:${links.email}`} className="btn secondary">
              Email direct
            </a>
          </div>
        </article>
      </section>

      <section className="section center-section">
        <h2>Partager ce portfolio</h2>
        <div className="cta-row center-row">
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
