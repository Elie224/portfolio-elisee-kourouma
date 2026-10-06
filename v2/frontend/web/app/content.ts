export const profile = {
  name: "Nema Elisee Kourouma",
  title: "Produit · IA · Web",
  subtitle: "Master 1 en Intelligence Artificielle · Ecole Superieure d'Informatique de Paris",
  description:
    "Issu d'une formation en mathematiques et informatique (USMBA Fes), je developpe une forte appetence pour les produits data et l'intelligence artificielle. J'aime transformer des idees en solutions concretes, utiles et orientees impact.",
};

export const PROJECT_TYPES = [
  "Projet Majeur",
  "Projet de cours",
  "PFE Licence",
  "PFA",
  "PFE Master",
  "Projet Personnel",
  "Contrat",
  "Apprentissage",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export interface ProjectItem {
  slug: string;
  title: string;
  type: ProjectType;
  summary: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  documentUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  requiresAccessCode?: boolean;
  stack: string[];
  featured: boolean;
  status: "published" | "draft";
  publishedAt: string;
}

export const projectCatalog: ProjectItem[] = [
  {
    slug: "ebp-postgres",
    title: "EBP vers PostgreSQL",
    type: "Contrat",
    summary: "Pipeline de migration et fiabilisation de donnees pour alimenter la BI.",
    stack: ["dlt", "PostgreSQL", "Metabase"],
    featured: true,
    status: "published",
    publishedAt: "2026-09-12",
  },
  {
    slug: "openbot-assistant",
    title: "OpenBot Assistant",
    type: "Projet Majeur",
    summary: "Orchestration d'agents specialises pour automatiser des taches metier.",
    stack: ["Python", "API", "Agents"],
    featured: true,
    status: "published",
    publishedAt: "2026-08-01",
  },
  {
    slug: "pdf-ebp-automation",
    title: "Automatisation PDF vers EBP",
    type: "Projet Personnel",
    summary: "Extraction de donnees PDF vers CSV et pre-import pour EBP.",
    stack: ["OCR", "Python", "CSV"],
    featured: false,
    status: "published",
    publishedAt: "2026-07-18",
  },
  {
    slug: "dashboards-metabase-finance",
    title: "Dashboards Metabase Finance",
    type: "Contrat",
    summary: "Conception de tableaux de bord metier pour pilotage de la performance.",
    stack: ["PostgreSQL", "Metabase", "SQL"],
    featured: false,
    status: "published",
    publishedAt: "2026-06-22",
  },
  {
    slug: "plateforme-stage-esi",
    title: "Plateforme de Suivi de Stage",
    type: "Projet de cours",
    summary: "Application web de suivi administratif et pedagogique des stages.",
    stack: ["Node.js", "MongoDB", "Express"],
    featured: false,
    status: "published",
    publishedAt: "2025-11-05",
  },
  {
    slug: "ml-quality-check",
    title: "ML Quality Check",
    type: "Projet Majeur",
    summary: "Prototype d'evaluation de qualite de donnees et derive de modeles.",
    stack: ["Python", "Pandas", "Scikit-learn"],
    featured: false,
    status: "draft",
    publishedAt: "2026-10-01",
  },
];

export const projectHighlights = projectCatalog.filter(
  (project) => project.status === "published" && project.featured,
);

export function getPublishedProjects(): ProjectItem[] {
  return projectCatalog.filter((project) => project.status === "published");
}

export function getPublishedProjectBySlug(slug: string): ProjectItem | undefined {
  return getPublishedProjects().find((project) => project.slug === slug);
}

export const services = {
  proposed: [
    "Audit Data/IA et cadrage d'architecture",
    "Conception d'API et applications web metier",
    "Industrialisation de pipelines data",
  ],
  delivered: [
    "Migration SQL Server vers PostgreSQL",
    "Mise en place de dashboards Metabase",
  ],
  inProgress: [
    "Automatisations intelligentes orientees operations",
    "Outillage IA pour processus documentaires",
  ],
};

export const reports = [
  "EBP vers PostgreSQL: retour d'experience et architecture cible",
  "Mise en place d'un systeme multi-agents pour productivite metier",
  "Dashboards financiers avec PostgreSQL et Metabase",
];
