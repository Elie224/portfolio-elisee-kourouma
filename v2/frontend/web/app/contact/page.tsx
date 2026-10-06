import ContactForm from "./contact-form";
import { getPortfolioContent } from "@/lib/portfolio-content-store";
import BackBar from "@/app/components/back-bar";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await getPortfolioContent();

  return buildPageMetadata({
    pathname: "/contact",
    title: `Contact - ${content.personal.name}`,
    description: "Contact pour collaboration, missions IA/data et developpement web.",
  });
}

export default async function ContactPage() {
  const content = await getPortfolioContent();
  return (
    <>
      <BackBar />
      <section className="hero split-hero">
        <div className="hero-copy">
          <p className="hero-kicker">Contact</p>
          <h1>Parlons de votre projet</h1>
          <p>
            Contactez-moi pour discuter de vos projets en intelligence
            artificielle, analyse des donnees ou data engineering.
          </p>
          <div className="cta-row">
            <a href={`mailto:${content.links.email}`} className="btn secondary">
              Envoyer un email
            </a>
          </div>
        </div>

        <article className="card contact-panel">
          <h3>Infos rapides</h3>
          <p><strong>Email:</strong> {content.links.email}</p>
          <p><strong>Disponibilite:</strong> Missions freelance et CDI data/IA.</p>
          <p><strong>Delai de reponse:</strong> 24 a 48 heures.</p>
        </article>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Envoyer un message</h2>
          <p>
            Utilisez ce formulaire pour une demande de mission, un partenariat
            ou un echange autour de vos enjeux data et IA.
          </p>
        </div>
        <ContactForm />
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Autres canaux</h2>
          <p>Choisissez le canal le plus pratique pour vous.</p>
        </div>
        <div className="grid grid-3">
          <article className="card">
            <h3>Email</h3>
            <p>{content.links.email}</p>
          </article>
          <article className="card">
            <h3>LinkedIn</h3>
            <p>{content.links.linkedin || "Lien a configurer"}</p>
          </article>
          <article className="card">
            <h3>GitHub</h3>
            <p>{content.links.github || "Lien a configurer"}</p>
          </article>
        </div>
      </section>
    </>
  );
}
