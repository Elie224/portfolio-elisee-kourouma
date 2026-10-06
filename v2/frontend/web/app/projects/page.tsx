import { listPublishedProjects } from "@/lib/projects-store";
import BackBar from "@/app/components/back-bar";
import ProjectsCatalog from "./projects-catalog";
import { getPortfolioContent } from "@/lib/portfolio-content-store";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const content = await getPortfolioContent();

  return buildPageMetadata({
    pathname: "/projects",
    title: `Projets - ${content.personal.name}`,
    description: "Catalogue des projets web, data et IA avec details techniques et documents associes.",
  });
}

export default async function ProjectsPage() {
  const projects = await listPublishedProjects();

  return (
    <>
      <BackBar />
      <section className="hero">
        <h1>Projets & expériences</h1>
        <p>
          Produits web et IA conçus avec une approche orientée impact : rapides,
          sécurisés et maintenables de bout en bout.
        </p>
      </section>

      <ProjectsCatalog projects={projects} />
    </>
  );
}
