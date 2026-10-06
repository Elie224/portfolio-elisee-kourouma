import type { ProjectItem } from "@/app/content";
import type { PortfolioContent } from "@/lib/portfolio-content-store";

function normalizeSiteUrl(raw: string | undefined): string {
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function absoluteUrl(siteUrl: string, path: string): string | undefined {
  if (!siteUrl) return undefined;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function buildHomepageStructuredData(content: PortfolioContent): string {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const profileImageUrl = absoluteUrl(siteUrl, "/images/profile-photo.jpeg");
  const sameAs = [content.links.linkedin, content.links.github].filter(Boolean);

  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": siteUrl ? `${siteUrl}#person` : "#person",
        name: content.personal.name,
        jobTitle: content.personal.title,
        description: content.about.description,
        email: `mailto:${content.links.email}`,
        url: siteUrl || undefined,
        image: profileImageUrl,
        sameAs: sameAs.length > 0 ? sameAs : undefined,
      },
      {
        "@type": "WebSite",
        "@id": siteUrl ? `${siteUrl}#website` : "#website",
        name: content.seo.title || content.personal.name,
        description: content.seo.description,
        url: siteUrl || undefined,
        inLanguage: "fr-FR",
      },
    ],
  };

  return JSON.stringify(payload);
}

export function buildProjectStructuredData(
  project: ProjectItem,
  authorName: string,
  authorProfileUrl?: string,
): string {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const projectUrl = absoluteUrl(siteUrl, `/projects/${project.slug}`);
  const imageUrl = project.imageUrl
    ? project.imageUrl.startsWith("http")
      ? project.imageUrl
      : absoluteUrl(siteUrl, project.imageUrl) || project.imageUrl
    : absoluteUrl(siteUrl, "/images/profile-photo.jpeg");

  const payload = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    datePublished: project.publishedAt,
    inLanguage: "fr-FR",
    url: projectUrl,
    image: imageUrl,
    genre: project.type,
    keywords: project.stack.join(", "),
    author: {
      "@type": "Person",
      name: authorName,
      url: authorProfileUrl || siteUrl || undefined,
    },
  };

  return JSON.stringify(payload);
}
