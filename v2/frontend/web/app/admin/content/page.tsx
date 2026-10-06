import { getPortfolioContent } from "@/lib/portfolio-content-store";
import Link from "next/link";

export const metadata = {
  title: "Admin Content - Portfolio V2",
};

const sectionLinks = [
  { href: "/admin/content/overview", label: "Vue d'ensemble" },
  { href: "/admin/content/profile", label: "Profil & About" },
  { href: "/admin/content/links", label: "Liens" },
  { href: "/admin/content/services", label: "Services" },
  { href: "/admin/content/reports", label: "Rapports" },
  { href: "/admin/content/seo", label: "SEO" },
  { href: "/admin/content/settings", label: "Settings" },
  { href: "/admin/content/account", label: "Account" },
  { href: "/admin/content/skills", label: "Skills" },
  { href: "/admin/content/timeline", label: "Timeline" },
  { href: "/admin/content/faq", label: "FAQ" },
  { href: "/admin/content/activeSearches", label: "Recherches" },
  { href: "/admin/content/certifications", label: "Certifications" },
  { href: "/admin/content/stages", label: "Stages" },
  { href: "/admin/content/alternances", label: "Alternances" },
  { href: "/admin/content/techEvents", label: "Evenements" },
  { href: "/admin/content/testimonials", label: "Temoignages" },
];

export default async function AdminContentPage() {
  const content = await getPortfolioContent();

  return (
    <>
      <section className="hero">
        <h1>Contenu global par section</h1>
        <p>
          Chaque bloc du contenu est maintenant sur une page dediee pour une
          edition plus rapide et moins fatigante.
        </p>
      </section>

      <section className="section">
        <h2>Choisir une section</h2>
        <div className="grid grid-3">
          {sectionLinks.map((item) => (
            <article className="card" key={item.href}>
              <h3>{item.label}</h3>
              <div className="cta-row">
                <Link href={item.href} className="btn primary">
                  Ouvrir
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Etat rapide</h2>
        <div className="grid grid-3">
          <article className="card stats-card">
            <p>Skills</p>
            <strong>{content.skills.length}</strong>
          </article>
          <article className="card stats-card">
            <p>Timeline</p>
            <strong>{content.timeline.length}</strong>
          </article>
          <article className="card stats-card">
            <p>FAQ</p>
            <strong>{content.faq.length}</strong>
          </article>
        </div>
      </section>
    </>
  );
}
