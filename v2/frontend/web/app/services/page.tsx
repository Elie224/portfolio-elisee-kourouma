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
        <h1>Mes services</h1>
        <p>
          J&apos;accompagne les entreprises, porteurs de projet et equipes sur des
          besoins concrets en IA, data et developpement web.
        </p>
      </section>

      <section className="section">
        <h2>Services que je propose</h2>
        <div className="grid grid-3">
          {services.proposed.map((item) => (
            <article className="card" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Service livré</h2>
        <div className="grid grid-3">
          {services.delivered.map((item) => (
            <article className="card" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Service en cours</h2>
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
