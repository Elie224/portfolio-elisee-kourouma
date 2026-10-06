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
      <section className="hero">
        <h1>Contact</h1>
        <p>
          Contactez-moi pour discuter de vos projets en intelligence
          artificielle, analyse des donnees ou data engineering.
        </p>
        <div className="cta-row">
          <a href={`mailto:${content.links.email}`} className="btn secondary">
            Envoyer un email
          </a>
        </div>
      </section>

      <section className="section">
        <h2>Me joindre</h2>
        <div className="grid grid-3">
          <article className="card">
            <h3>Email</h3>
            <p>{content.links.email}</p>
          </article>
          <article className="card">
            <h3>Disponibilité</h3>
            <p>Missions freelance et CDI data/IA.</p>
          </article>
          <article className="card">
            <h3>Réponse</h3>
            <p>Retour sous 24 à 48 heures.</p>
          </article>
        </div>

        <div className="section" style={{ marginTop: "1rem" }}>
          <h2>Envoyer un message</h2>
          <p>
            Utilisez ce formulaire pour une demande de mission, un partenariat
            ou un echange autour de vos enjeux data et IA.
          </p>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
