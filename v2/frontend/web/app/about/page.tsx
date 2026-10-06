import Link from "next/link";
import BackBar from "@/app/components/back-bar";
import { getPortfolioContent } from "@/lib/portfolio-content-store";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await getPortfolioContent();

  return buildPageMetadata({
    pathname: "/about",
    title: `A propos - ${content.personal.name}`,
    description: content.about.description,
  });
}

export default async function AboutPage() {
  const content = await getPortfolioContent();
  return (
    <>
      <BackBar />
      <section className="hero">
        <h1>Profil & parcours</h1>
        <p>{content.about.description}</p>
      </section>

      <section className="section">
        <h2>En quelques chiffres</h2>
        <div className="grid grid-3">
          <article className="card">
            <h3>Projets livres</h3>
            <p>10+</p>
          </article>
          <article className="card">
            <h3>Annees d&apos;experience</h3>
            <p>2+</p>
          </article>
          <article className="card">
            <h3>Technologies maîtrisées</h3>
            <p>10+</p>
          </article>
        </div>
      </section>

      <section className="section">
        <article className="card">
          <h2>Qui suis-je ?</h2>
          <p>{content.about.description}</p>
          {content.personal.currentEducation ? (
            <p>
              <strong>Formation actuelle:</strong> {content.personal.currentEducation}
            </p>
          ) : null}
          {content.personal.previousEducation ? (
            <p>
              <strong>Formation precedente:</strong> {content.personal.previousEducation}
            </p>
          ) : null}
          {content.personal.phone ? (
            <p>
              <strong>Telephone:</strong> {content.personal.phone}
            </p>
          ) : null}
          {content.personal.email ? (
            <p>
              <strong>Email:</strong> {content.personal.email}
            </p>
          ) : null}
        </article>
      </section>

      <section className="section">
        <h2>Temoignages</h2>
        <div className="grid grid-2">
          {content.testimonials.length === 0 ? (
            <article className="card">
              <p>Aucun temoignage renseigne.</p>
            </article>
          ) : (
            content.testimonials.map((item, index) => (
              <article className="card" key={`${item.name}-${index}`}>
                <p style={{ marginTop: 0 }}>&ldquo;{item.quote}&rdquo;</p>
                <p style={{ marginBottom: 0 }}>
                  <strong>{item.name}</strong>
                  {item.role ? ` · ${item.role}` : ""}
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2>Mon parcours</h2>
        <div className="grid">
          {content.timeline.length === 0 ? (
            <article className="card">
              <p>Aucun élément de parcours pour le moment.</p>
            </article>
          ) : (
            content.timeline.map((item, index) => (
              <article className="card" key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                {item.date ? <p>{item.date}</p> : null}
                {item.description ? <p>{item.description}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2>Certifications</h2>
        <div className="grid grid-2">
          {content.certifications.length === 0 ? (
            <article className="card">
              <p>Aucune certification renseignée.</p>
            </article>
          ) : (
            content.certifications.map((item, index) => (
              <article className="card" key={`${item.name}-${index}`}>
                <h3>{item.name}</h3>
                {item.issuer ? <p>{item.issuer}</p> : null}
                {item.date ? <p>{item.date}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2>Stages</h2>
        <p>Demandes de code et telechargements pour les stages realises.</p>
        <div className="grid grid-2">
          {content.stages.length === 0 ? (
            <article className="card">
              <p>Aucun stage renseigné.</p>
            </article>
          ) : (
            content.stages.map((item, index) => (
              <article className="card" key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                {item.company ? <p>{item.company}</p> : null}
                {item.period ? <p>{item.period}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2>Alternances</h2>
        <p>Demandes de code et telechargements pour les alternances.</p>
        <div className="grid grid-2">
          {content.alternances.length === 0 ? (
            <article className="card">
              <p>Aucune alternance renseignée.</p>
            </article>
          ) : (
            content.alternances.map((item, index) => (
              <article className="card" key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                {item.company ? <p>{item.company}</p> : null}
                {item.period ? <p>{item.period}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2>Événements technologiques</h2>
        <p>Veille, participation et immersion dans l&apos;écosystème tech.</p>
        <div className="grid grid-2">
          {content.techEvents.length === 0 ? (
            <article className="card">
              <p>Aucun événement renseigné.</p>
            </article>
          ) : (
            content.techEvents.map((item, index) => (
              <article className="card" key={`${item.name}-${index}`}>
                <h3>{item.name}</h3>
                {item.location ? <p>{item.location}</p> : null}
                {item.date ? <p>{item.date}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2>FAQ</h2>
        <p>Les réponses aux questions les plus fréquentes.</p>
        <div className="grid">
          {content.faq.length === 0 ? (
            <article className="card">
              <p>Aucune question fréquente renseignée.</p>
            </article>
          ) : (
            content.faq.map((item, index) => (
              <article className="card" key={`${item.question}-${index}`}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <h2>Mes valeurs</h2>
        <div className="grid grid-2">
          <article className="card">
            <h3>Innovation utile</h3>
            <p>Des solutions modernes mais pragmatiques, alignees sur les besoins reels.</p>
          </article>
          <article className="card">
            <h3>Excellence produit</h3>
            <p>Qualite, performance et securite integrees des la conception.</p>
          </article>
          <article className="card">
            <h3>Apprentissage continu</h3>
            <p>Veille technologique et amelioration constante des pratiques.</p>
          </article>
          <article className="card">
            <h3>Clarte & collaboration</h3>
            <p>Communication transparente et travail d&apos;equipe oriente resultats.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <article className="card" style={{ textAlign: "center" }}>
          <h2>Travaillons ensemble</h2>
          <p>Un projet en tete ? Ecrivons un plan d&apos;action realiste et livrable.</p>
          <div className="cta-row" style={{ justifyContent: "center" }}>
            <Link href="/contact" className="btn">
              Me contacter
            </Link>
            <Link href="/projects" className="btn secondary">
              Voir mes projets
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
