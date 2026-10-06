import Link from "next/link";
import ContentEditorClient from "../content-editor-client";
import { getPortfolioContent } from "@/lib/portfolio-content-store";

const sectionLabels: Record<string, string> = {
  overview: "Vue d'ensemble",
  profile: "Profil & About",
  links: "Liens",
  services: "Services",
  reports: "Rapports",
  seo: "SEO",
  settings: "Settings",
  account: "Account",
  skills: "Skills",
  timeline: "Timeline",
  faq: "FAQ",
  activeSearches: "Recherches",
  certifications: "Certifications",
  stages: "Stages",
  alternances: "Alternances",
  techEvents: "Evenements",
  testimonials: "Temoignages",
};

const sectionOrder = [
  "overview",
  "profile",
  "links",
  "services",
  "reports",
  "seo",
  "settings",
  "account",
  "skills",
  "timeline",
  "faq",
  "activeSearches",
  "certifications",
  "stages",
  "alternances",
  "techEvents",
  "testimonials",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const value = (await params).section;
  const label = sectionLabels[value] || "Section";

  return {
    title: `Admin Content - ${label}`,
  };
}

export default async function AdminContentSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const content = await getPortfolioContent();
  const section = (await params).section;
  const currentSection = sectionLabels[section] ? section : "overview";
  const currentIndex = sectionOrder.indexOf(currentSection as (typeof sectionOrder)[number]);
  const previous = currentIndex > 0 ? sectionOrder[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < sectionOrder.length - 1
      ? sectionOrder[currentIndex + 1]
      : null;

  return (
    <>
      <section className="hero">
        <h1>{sectionLabels[currentSection]}</h1>
        <p>Edition dediee d&apos;une seule section pour aller plus vite.</p>
      </section>

      <section className="section">
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <Link href="/admin/content" className="btn">
            Retour aux sections
          </Link>
          <div className="cta-row" style={{ marginTop: 0 }}>
            {previous ? (
              <Link href={`/admin/content/${previous}`} className="btn">
                Section precedente
              </Link>
            ) : null}
            {next ? (
              <Link href={`/admin/content/${next}`} className="btn secondary">
                Section suivante
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <ContentEditorClient
          initialContent={content}
          initialSection={currentSection}
          lockedSection={currentSection}
        />
      </section>
    </>
  );
}
