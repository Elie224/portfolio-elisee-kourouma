import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { profile, reports, services } from "@/app/content";

interface D1Like {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: <T>() => Promise<T | null>;
    };
  };
}

interface SiteContentRow {
  valueJson: string;
}

export interface PortfolioContent {
  personal: {
    name: string;
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    phone: string;
    currentEducation: string;
    previousEducation: string;
    photo: string;
  };
  about: {
    description: string;
  };
  links: {
    email: string;
    cvUrl: string;
    linkedin: string;
    github: string;
  };
  skills: Array<{ name: string; level?: string }>;
  timeline: Array<{ title: string; date?: string; description?: string }>;
  activeSearches: Array<{ title: string; status?: string }>;
  certifications: Array<{ name: string; issuer?: string; date?: string }>;
  stages: Array<{ title: string; company?: string; period?: string; documentUrl?: string }>;
  alternances: Array<{ title: string; company?: string; period?: string; documentUrl?: string }>;
  techEvents: Array<{ name: string; date?: string; location?: string }>;
  testimonials: Array<{ name: string; role?: string; quote: string }>;
  services: {
    proposed: string[];
    delivered: string[];
    inProgress: string[];
  };
  faq: Array<{ question: string; answer: string }>;
  reports: string[];
  seo: {
    title: string;
    description: string;
    keywords: string;
    gaId: string;
  };
  settings: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    allowContact: boolean;
  };
  account: {
    adminEmail: string;
    note: string;
  };
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "portfolio-content.json");
const CONTENT_KEY = "portfolio_content";

const defaultContent: PortfolioContent = {
  personal: {
    name: profile.name,
    title: profile.title,
    subtitle: profile.subtitle,
    fullName: profile.name,
    email: "kouroumaelisee@gmail.com",
    phone: "",
    currentEducation: "",
    previousEducation: "",
    photo: "/images/profile-photo.jpeg",
  },
  about: {
    description: profile.description,
  },
  links: {
    email: "kouroumaelisee@gmail.com",
    cvUrl: "/assets/CV.pdf",
    linkedin: "",
    github: "",
  },
  skills: [],
  timeline: [],
  activeSearches: [],
  certifications: [],
  stages: [],
  alternances: [],
  techEvents: [],
  testimonials: [],
  services,
  faq: [],
  reports,
  seo: {
    title: "Nema Elisee Kourouma - Portfolio V2",
    description: "Portfolio V2 refondu avec Next.js, TypeScript et App Router.",
    keywords: "portfolio,data,ia,web",
    gaId: "",
  },
  settings: {
    maintenanceMode: false,
    maintenanceMessage: "Le site est temporairement en maintenance. Merci de revenir plus tard.",
    allowContact: true,
  },
  account: {
    adminEmail: "admin@portfolio.local",
    note: "",
  },
};

function resolveD1Binding(): D1Like | null {
  const g = globalThis as unknown as {
    DB?: D1Like;
    env?: { DB?: D1Like };
    __env?: { DB?: D1Like };
    cloudflare?: { env?: { DB?: D1Like } };
  };

  return g.DB ?? g.env?.DB ?? g.__env?.DB ?? g.cloudflare?.env?.DB ?? null;
}

function normalize(input: unknown): PortfolioContent {
  if (!input || typeof input !== "object") return structuredClone(defaultContent);
  const value = input as Partial<PortfolioContent>;

  return {
    personal: {
      name: String(value.personal?.name || defaultContent.personal.name),
      title: String(value.personal?.title || defaultContent.personal.title),
      subtitle: String(value.personal?.subtitle || defaultContent.personal.subtitle),
      fullName: String(value.personal?.fullName || value.personal?.name || defaultContent.personal.fullName),
      email: String(value.personal?.email || defaultContent.personal.email),
      phone: String(value.personal?.phone || defaultContent.personal.phone),
      currentEducation: String(
        value.personal?.currentEducation || defaultContent.personal.currentEducation,
      ),
      previousEducation: String(
        value.personal?.previousEducation || defaultContent.personal.previousEducation,
      ),
      photo: String(value.personal?.photo || defaultContent.personal.photo),
    },
    about: {
      description: String(value.about?.description || defaultContent.about.description),
    },
    links: {
      email: String(value.links?.email || defaultContent.links.email),
      cvUrl: String(value.links?.cvUrl || defaultContent.links.cvUrl),
      linkedin: String(value.links?.linkedin || defaultContent.links.linkedin),
      github: String(value.links?.github || defaultContent.links.github),
    },
    skills: Array.isArray(value.skills) ? value.skills : [],
    timeline: Array.isArray(value.timeline) ? value.timeline : [],
    activeSearches: Array.isArray(value.activeSearches) ? value.activeSearches : [],
    certifications: Array.isArray(value.certifications) ? value.certifications : [],
    stages: Array.isArray(value.stages) ? value.stages : [],
    alternances: Array.isArray(value.alternances) ? value.alternances : [],
    techEvents: Array.isArray(value.techEvents) ? value.techEvents : [],
    testimonials: Array.isArray(value.testimonials) ? value.testimonials : [],
    services: {
      proposed: Array.isArray(value.services?.proposed)
        ? value.services?.proposed
        : defaultContent.services.proposed,
      delivered: Array.isArray(value.services?.delivered)
        ? value.services?.delivered
        : defaultContent.services.delivered,
      inProgress: Array.isArray(value.services?.inProgress)
        ? value.services?.inProgress
        : defaultContent.services.inProgress,
    },
    faq: Array.isArray(value.faq) ? value.faq : [],
    reports: Array.isArray(value.reports) ? value.reports : defaultContent.reports,
    seo: {
      title: String(value.seo?.title || defaultContent.seo.title),
      description: String(value.seo?.description || defaultContent.seo.description),
      keywords: String(value.seo?.keywords || defaultContent.seo.keywords),
      gaId: String(value.seo?.gaId || defaultContent.seo.gaId),
    },
    settings: {
      maintenanceMode:
        typeof value.settings?.maintenanceMode === "boolean"
          ? value.settings.maintenanceMode
          : defaultContent.settings.maintenanceMode,
      maintenanceMessage: String(
        value.settings?.maintenanceMessage || defaultContent.settings.maintenanceMessage,
      ),
      allowContact:
        typeof value.settings?.allowContact === "boolean"
          ? value.settings.allowContact
          : defaultContent.settings.allowContact,
    },
    account: {
      adminEmail: String(value.account?.adminEmail || defaultContent.account.adminEmail),
      note: String(value.account?.note || defaultContent.account.note),
    },
  };
}

async function ensureD1Table(db: D1Like): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `;
  await db.prepare(sql).bind().run();
}

async function readLocal(): Promise<PortfolioContent> {
  await mkdir(DATA_DIR, { recursive: true }).catch(() => undefined);
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return normalize(JSON.parse(raw));
  } catch {
    const seeded = structuredClone(defaultContent);
    // Workers can run without writable local filesystem; keep runtime alive with defaults.
    await writeFile(STORE_FILE, JSON.stringify(seeded, null, 2), "utf8").catch(
      () => undefined,
    );
    return seeded;
  }
}

async function writeLocal(value: PortfolioContent): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(value, null, 2), "utf8");
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureD1Table(d1);
    const row = await d1
      .prepare("SELECT value_json AS valueJson FROM site_content WHERE key = ? LIMIT 1")
      .bind(CONTENT_KEY)
      .first<SiteContentRow>();

    if (row?.valueJson) {
      try {
        return normalize(JSON.parse(row.valueJson));
      } catch {
        return normalize(defaultContent);
      }
    }

    const initial = normalize(defaultContent);
    await d1
      .prepare("INSERT INTO site_content (key, value_json) VALUES (?, ?)")
      .bind(CONTENT_KEY, JSON.stringify(initial))
      .run();
    return initial;
  }

  return readLocal();
}

export async function savePortfolioContent(content: unknown): Promise<PortfolioContent> {
  const normalized = normalize(content);
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureD1Table(d1);
    await d1
      .prepare(
        "INSERT INTO site_content (key, value_json, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = datetime('now')",
      )
      .bind(CONTENT_KEY, JSON.stringify(normalized))
      .run();
    return normalized;
  }

  await writeLocal(normalized);
  return normalized;
}
