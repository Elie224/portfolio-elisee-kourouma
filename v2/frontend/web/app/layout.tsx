import type { Metadata } from "next";
import { Sora, Space_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import MaintenanceGuard from "@/app/components/maintenance-guard";
import { getPortfolioContent } from "@/lib/portfolio-content-store";
import "./globals.css";

const sora = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-geist-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPortfolioContent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio.local";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: content.seo.title || "Nema Elisee Kourouma - Portfolio V2",
      template: "%s | Portfolio",
    },
    description:
      content.seo.description ||
      "Portfolio V2 refondu avec Next.js, TypeScript et App Router.",
    keywords: content.seo.keywords,
  };
}

const links = [
  { href: "/", label: "Accueil" },
  { href: "/about", label: "À propos" },
  { href: "/projects", label: "Projets" },
  { href: "/services", label: "Mes services" },
  { href: "/reports", label: "Mes rapports" },
  { href: "/contact", label: "Contact" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getPortfolioContent();
  const gaId = content.seo.gaId.trim();

  return (
    <html
      lang="fr"
      className={`${sora.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-page text-ink">
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
              strategy="afterInteractive"
            />
            <Script id="ga-runtime" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}');`}
            </Script>
          </>
        ) : null}
        <div className="page-bg" aria-hidden="true" />
        <header className="site-shell">
          <nav className="top-nav">
            <Link href="/" className="brand">
              Mon Portfolio
            </Link>
            <div className="nav-links">
              {links.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <MaintenanceGuard
          maintenanceMode={content.settings.maintenanceMode}
          maintenanceMessage={content.settings.maintenanceMessage}
          email={content.links.email}
        >
          <main className="site-shell main-content">{children}</main>
        </MaintenanceGuard>

        <footer className="site-shell footer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 2v20" />
            <path d="M2 11h20" />
          </svg>
          <span>© Mon Portfolio</span>
          <span aria-hidden="true">·</span>
          <span>{new Date().getFullYear()}</span>
          <span aria-hidden="true">·</span>
          <span>Psaume 23</span>
        </footer>
      </body>
    </html>
  );
}
