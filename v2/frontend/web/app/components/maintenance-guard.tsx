"use client";

import { usePathname } from "next/navigation";

const BYPASS_PREFIXES = ["/admin", "/auth", "/_next"];

export default function MaintenanceGuard({
  maintenanceMode,
  maintenanceMessage,
  email,
  children,
}: {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  email?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const isBypassed = BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!maintenanceMode || isBypassed) {
    return <>{children}</>;
  }

  return (
    <main className="site-shell main-content">
      <section className="hero maintenance-hero">
        <p className="hero-kicker">Maintenance</p>
        <h1>Le site est temporairement indisponible</h1>
        <p>{maintenanceMessage}</p>
        {email ? (
          <div className="cta-row">
            <a href={`mailto:${email}`} className="btn primary">
              Contacter l&apos;administrateur
            </a>
          </div>
        ) : null}
      </section>
    </main>
  );
}
