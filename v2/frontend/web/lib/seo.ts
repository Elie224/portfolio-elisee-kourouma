import type { Metadata } from "next";
import { getPortfolioContent } from "@/lib/portfolio-content-store";

function normalizeSiteUrl(raw: string | undefined): string {
  if (!raw) return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function buildAbsoluteUrl(siteUrl: string, pathname: string): string | undefined {
  if (!siteUrl) return undefined;
  const base = normalizeSiteUrl(siteUrl);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export async function buildPageMetadata(options: {
  pathname: string;
  title: string;
  description: string;
  imagePath?: string;
  noIndex?: boolean;
}): Promise<Metadata> {
  const content = await getPortfolioContent();
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const canonical = buildAbsoluteUrl(siteUrl, options.pathname);
  const imagePath = options.imagePath || "/images/profile-photo.jpeg";
  const imageUrl = buildAbsoluteUrl(siteUrl, imagePath) || imagePath;
  const pageTitle = options.title;
  const pageDescription = options.description;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: content.seo.keywords,
    alternates: canonical
      ? {
          canonical,
        }
      : undefined,
    robots: options.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      title: pageTitle,
      description: pageDescription,
      url: canonical,
      siteName: content.personal.name,
      images: [
        {
          url: imageUrl,
          alt: content.personal.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [imageUrl],
    },
  };
}