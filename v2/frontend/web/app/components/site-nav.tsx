"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Stack" },
  { href: "/reports", label: "Reports" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function SiteNav({
  linkedin,
  github,
}: {
  linkedin?: string;
  github?: string;
}) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  return (
    <nav className="top-nav" aria-label="Navigation principale">
      <Link href="/" className="brand" aria-label="Retour accueil">
        Elisee
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav-links"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>

      <div className="nav-cluster">
        <div id="site-nav-links" className={`nav-links${open ? " open" : ""}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "is-active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-social" aria-label="Raccourcis sociaux">
          {linkedin ? (
            <a href={linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          ) : null}
          {github ? (
            <a href={github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
