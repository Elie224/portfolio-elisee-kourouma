import Link from "next/link";
import { listAllProjects } from "@/lib/projects-store";
import { listMessages } from "@/lib/messages-store";
import { getPortfolioContent } from "@/lib/portfolio-content-store";

export const metadata = {
  title: "Admin - Portfolio V2",
};

const adminSections = [
  "Dashboard",
  "Projects",
  "Experience",
  "Education",
  "Skills",
  "Events",
  "FAQ",
  "Messages",
  "SEO",
  "Settings",
  "Account",
];

export default async function AdminPage() {
  const [projects, messages, content] = await Promise.all([
    listAllProjects(),
    listMessages(500),
    getPortfolioContent(),
  ]);

  const publishedProjects = projects.filter((project) => project.status === "published").length;
  const draftProjects = projects.filter((project) => project.status === "draft").length;
  const unreadMessages = messages.filter((message) => !message.readAt).length;

  return (
    <>
      <section className="hero">
        <h1>Admin</h1>
        <p>
          Zone d&apos;administration securisee. L&apos;acces est protege par un lien
          prive, puis par authentification email/mot de passe.
        </p>
      </section>

      <section className="section">
        <h2>Tableau de bord</h2>
        <div className="grid grid-3">
          <article className="card stats-card">
            <p>Projets (total)</p>
            <strong>{projects.length}</strong>
          </article>
          <article className="card stats-card">
            <p>Projets publies</p>
            <strong>{publishedProjects}</strong>
          </article>
          <article className="card stats-card">
            <p>Projets brouillon</p>
            <strong>{draftProjects}</strong>
          </article>
          <article className="card stats-card">
            <p>Messages recus</p>
            <strong>{messages.length}</strong>
          </article>
          <article className="card stats-card">
            <p>Messages non lus</p>
            <strong>{unreadMessages}</strong>
          </article>
          <article className="card stats-card">
            <p>Maintenance</p>
            <strong>{content.settings.maintenanceMode ? "Active" : "Inactive"}</strong>
          </article>
        </div>
      </section>

      <section className="section">
        <h2>Actions rapides</h2>
        <div className="cta-row" style={{ marginBottom: "0.8rem" }}>
          <Link href="/admin/projects" className="btn primary">
            Gerer les projets
          </Link>
          <Link href="/admin/content" className="btn primary">
            Gerer le contenu global
          </Link>
          <Link href="/admin/messages" className="btn primary">
            Ouvrir la boite de reception
          </Link>
        </div>
        <div className="grid grid-3">
          {adminSections.map((item) => (
            <article className="card" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Maintenance, SEO et Analytics</h2>
        <div className="grid grid-3">
          <article className="card">
            <h3>Maintenance</h3>
            <p>{content.settings.maintenanceMode ? "Active" : "Inactive"}</p>
            <div className="cta-row">
              <Link href="/admin/content/settings" className="btn">
                Ouvrir les settings
              </Link>
            </div>
          </article>

          <article className="card">
            <h3>SEO</h3>
            <p>{content.seo.title || "Titre SEO non renseigne"}</p>
            <div className="cta-row">
              <Link href="/admin/content/seo" className="btn">
                Modifier SEO
              </Link>
            </div>
          </article>

          <article className="card">
            <h3>Analytics</h3>
            <p>{content.seo.gaId ? `GA actif (${content.seo.gaId})` : "GA non configure"}</p>
            <div className="cta-row">
              <Link href="/admin/content/seo" className="btn">
                Configurer GA
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
