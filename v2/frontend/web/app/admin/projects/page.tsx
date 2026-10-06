import ProjectsAdminClient from "./projects-admin-client";
import { listAllProjects } from "@/lib/projects-store";

export const metadata = {
  title: "Admin Projects - Portfolio V2",
};

export default async function AdminProjectsPage() {
  const projects = await listAllProjects();

  return (
    <>
      <section className="hero">
        <h1>Admin · Projets</h1>
        <p>
          Gestion des projets de la V2: creation, edition, publication et suppression.
        </p>
      </section>

      <ProjectsAdminClient initialProjects={projects} />
    </>
  );
}
