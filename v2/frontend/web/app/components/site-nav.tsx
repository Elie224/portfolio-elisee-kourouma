"use client";

import Link from "next/link";
import { useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

export default function SiteNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={`top-nav${open ? " nav-open" : ""}`} aria-label="Navigation principale">
      <div className="top-nav-row">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          Mon Portfolio
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-nav-links"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div id="main-nav-links" className="nav-links" role="menu">
        {links.map((item) => (
          <Link key={item.href} href={item.href} role="menuitem" onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
