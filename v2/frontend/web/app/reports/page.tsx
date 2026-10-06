import { getPortfolioContent } from "@/lib/portfolio-content-store";
import BackBar from "@/app/components/back-bar";
import ReportsClient from "./reports-client";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await getPortfolioContent();

  return buildPageMetadata({
    pathname: "/reports",
    title: `Rapports - ${content.personal.name}`,
    description: "Rapports de stage et d'alternance avec acces protege par code et workflow de demande.",
  });
}

export default async function ReportsPage() {
  const content = await getPortfolioContent();
  const reports = content.reports;
  return (
    <>
      <BackBar />
      <section className="hero">
        <h1>Mes rapports</h1>
        <p>
          Rapports de stage et d&apos;alternance disponibles sur demande. Chaque
          document est protégé par un code partagé uniquement aux personnes
          autorisées.
        </p>
      </section>

      <section className="section">
        <article className="card">
          <h3>Accès protégé</h3>
          <p>
            1) Demandez le code via le bouton dédié. 2) Saisissez le code reçu
            pour télécharger le rapport. Les demandes sont envoyées directement
            à l&apos;auteur.
          </p>
          <p>
            Les documents peuvent être volumineux (PDF/Doc/Zip). Patientez
            quelques secondes après validation du code si le téléchargement ne
            démarre pas immédiatement.
          </p>
        </article>
      </section>

      <ReportsClient stages={content.stages} alternances={content.alternances} />

      <section className="section">
        <h2>Autres publications</h2>
        <div className="grid">
          {reports.map((item) => (
            <article className="card" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
