import Link from "next/link";
import type { ReactNode } from "react";
import LogoutButton from "./logout-button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <section className="section">
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <div className="cta-row" style={{ marginTop: 0 }}>
            <Link href="/admin" className="btn">
              Dashboard
            </Link>
            <Link href="/admin/projects" className="btn">
              Projets
            </Link>
            <Link href="/admin/content" className="btn">
              Contenu
            </Link>
            <Link href="/admin/messages" className="btn">
              Messages
            </Link>
          </div>
          <LogoutButton />
        </div>
      </section>
      {children}
    </>
  );
}
