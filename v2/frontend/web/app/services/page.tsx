import { getPortfolioContent } from "@/lib/portfolio-content-store";
import BackBar from "@/app/components/back-bar";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await getPortfolioContent();

  return buildPageMetadata({
    pathname: "/services",
    title: `Services - ${content.personal.name}`,
    description: "Prestations en intelligence artificielle, data engineering et developpement web orientes resultat.",
  });
}

export default async function ServicesPage() {
  const content = await getPortfolioContent();
  const services = content.services;
  return (
    <>
      <BackBar />
      <section className="hero">
        <p className="hero-kicker">Stack</p>
        <h1>Services et expertise</h1>
        <p>
          J&apos;accompagne les entreprises, porteurs de projet et equipes sur des
          besoins concrets en IA, data et developpement web avec une execution
          claire, mesuree et orientee resultat.
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Ce que je propose</h2>
          <p>Interventions possibles en cadrage, implementation et delivery.</p>
        </div>
        <div className="grid grid-3">
          {services.proposed.map((item) => (
            <article className="card" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Deja livre</h2>
          <p>References realisees sur des contextes techniques differents.</p>
        </div>
        <div className="grid grid-3">
          {services.delivered.map((item) => (
            <article className="card" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>En cours</h2>
          <p>Travaux actifs et pistes d&apos;amelioration en progression.</p>
        </div>
        <div className="grid grid-3">
          {services.inProgress.map((item) => (
            <article className="card" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
