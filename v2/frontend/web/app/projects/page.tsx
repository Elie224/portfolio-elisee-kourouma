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
        <p className="hero-kicker">Work</p>
        <h1>Selected Projects</h1>
        <p>
          Une vue d&apos;ensemble des projets produits, data et IA, avec contexte,
          decisions techniques et resultats.
        </p>
      </section>

      <ProjectsCatalog projects={projects} />
    </>
  );
}
