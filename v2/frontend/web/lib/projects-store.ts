import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ProjectItem, ProjectType } from "@/app/content";
import { projectCatalog } from "@/app/content";

interface D1Like {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: <T>() => Promise<T | null>;
      all: <T>() => Promise<{ results: T[] }>;
    };
  };
}

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  type: ProjectItem["type"];
  summary: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  documentUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  requiresAccessCode: number | boolean;
  stackJson: string | null;
  featured: number | boolean;
  status: "published" | "draft";
  publishedAt: string;
}

interface ProjectsStoreShape {
  projects: ProjectItem[];
}

export interface ProjectUpsertInput {
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
  publishedAt?: string;
  slug?: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "projects.json");

function resolveD1Binding(): D1Like | null {
  const g = globalThis as unknown as {
    DB?: D1Like;
    env?: { DB?: D1Like };
    __env?: { DB?: D1Like };
    cloudflare?: { env?: { DB?: D1Like } };
  };

  return g.DB ?? g.env?.DB ?? g.__env?.DB ?? g.cloudflare?.env?.DB ?? null;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}

function normalizeStore(input: unknown): ProjectsStoreShape {
  if (!input || typeof input !== "object") return { projects: [] };
  const projects = (input as { projects?: unknown }).projects;
  if (!Array.isArray(projects)) return { projects: [] };

  return {
    projects: projects.filter((item): item is ProjectItem => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<ProjectItem>;
      return (
        typeof candidate.slug === "string" &&
        typeof candidate.title === "string" &&
        typeof candidate.summary === "string"
      );
    }),
  };
}

async function ensureLocalStore(): Promise<ProjectsStoreShape> {
  await mkdir(DATA_DIR, { recursive: true }).catch(() => undefined);
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const store = normalizeStore(JSON.parse(raw));
    if (store.projects.length > 0) return store;
  } catch {
    // fallback below
  }

  const seeded: ProjectsStoreShape = { projects: [...projectCatalog] };
  // Workers can run without writable local filesystem; return seeded data if write fails.
  await writeFile(STORE_FILE, JSON.stringify(seeded, null, 2), "utf8").catch(
    () => undefined,
  );
  return seeded;
}

async function saveLocalStore(store: ProjectsStoreShape): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

async function ensureProjectsTableD1(db: D1Like): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      summary TEXT NOT NULL,
      image_url TEXT,
      thumbnail_url TEXT,
      document_url TEXT,
      live_url TEXT,
      github_url TEXT,
      requires_access_code INTEGER NOT NULL DEFAULT 0,
      stack_json TEXT NOT NULL DEFAULT '[]',
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      order_index INTEGER NOT NULL DEFAULT 0,
      published_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `;

  await db.prepare(sql).bind().run();

  try {
    await db.prepare("ALTER TABLE projects ADD COLUMN image_url TEXT").bind().run();
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
      throw error;
    }
  }

  try {
    await db.prepare("ALTER TABLE projects ADD COLUMN thumbnail_url TEXT").bind().run();
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
      throw error;
    }
  }

  try {
    await db.prepare("ALTER TABLE projects ADD COLUMN document_url TEXT").bind().run();
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
      throw error;
    }
  }

  try {
    await db.prepare("ALTER TABLE projects ADD COLUMN live_url TEXT").bind().run();
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
      throw error;
    }
  }

  try {
    await db.prepare("ALTER TABLE projects ADD COLUMN github_url TEXT").bind().run();
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
      throw error;
    }
  }

  try {
    await db
      .prepare("ALTER TABLE projects ADD COLUMN requires_access_code INTEGER NOT NULL DEFAULT 0")
      .bind()
      .run();
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
      throw error;
    }
  }
}

function mapRowToProject(row: ProjectRow): ProjectItem {
  let stack: string[] = [];
  if (row.stackJson) {
    try {
      const parsed = JSON.parse(row.stackJson) as unknown;
      if (Array.isArray(parsed)) {
        stack = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      stack = [];
    }
  }

  return {
    slug: row.slug,
    title: row.title,
    type: row.type,
    summary: row.summary,
    imageUrl: row.imageUrl ?? undefined,
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    documentUrl: row.documentUrl ?? undefined,
    liveUrl: row.liveUrl ?? undefined,
    githubUrl: row.githubUrl ?? undefined,
    requiresAccessCode: Boolean(row.requiresAccessCode),
    stack,
    featured: Boolean(row.featured),
    status: row.status,
    publishedAt: row.publishedAt,
  };
}

function getFallbackPublishedProjects(): ProjectItem[] {
  return projectCatalog.filter((project) => project.status === "published");
}

function sortProjects(projects: ProjectItem[]): ProjectItem[] {
  return [...projects].sort((a, b) => {
    const featuredDelta = Number(b.featured) - Number(a.featured);
    if (featuredDelta !== 0) return featuredDelta;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export async function listAllProjects(): Promise<ProjectItem[]> {
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureProjectsTableD1(d1);
    const sql = `
      SELECT
        id,
        slug,
        title,
        type,
        summary,
        image_url AS imageUrl,
        thumbnail_url AS thumbnailUrl,
        document_url AS documentUrl,
        live_url AS liveUrl,
        github_url AS githubUrl,
        requires_access_code AS requiresAccessCode,
        stack_json AS stackJson,
        featured,
        status,
        published_at AS publishedAt
      FROM projects
      ORDER BY featured DESC, order_index ASC, datetime(published_at) DESC
    `;

    const response = await d1.prepare(sql).bind().all<ProjectRow>();
    const rows = response.results ?? [];
    if (rows.length > 0) {
      return rows.map(mapRowToProject);
    }
  }

  const local = await ensureLocalStore();
  return sortProjects(local.projects);
}

export async function listPublishedProjects(): Promise<ProjectItem[]> {
  const all = await listAllProjects();
  const published = all.filter((project) => project.status === "published");
  if (published.length > 0) return sortProjects(published);
  return sortProjects(getFallbackPublishedProjects());
}

export async function listFeaturedPublishedProjects(limit = 3): Promise<ProjectItem[]> {
  const projects = await listPublishedProjects();
  return projects.filter((project) => project.featured).slice(0, limit);
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<ProjectItem | null> {
  const all = await listPublishedProjects();
  return all.find((project) => project.slug === slug) ?? null;
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  const all = await listAllProjects();
  return all.find((project) => project.slug === slug) ?? null;
}

export async function createProject(input: ProjectUpsertInput): Promise<ProjectItem> {
  const all = await listAllProjects();
  const baseSlug = toSlug(input.slug || input.title) || `project-${Date.now()}`;

  let slug = baseSlug;
  let i = 2;
  while (all.some((project) => project.slug === slug)) {
    slug = `${baseSlug}-${i}`;
    i += 1;
  }

  const project: ProjectItem = {
    slug,
    title: input.title.trim(),
    type: input.type,
    summary: input.summary.trim(),
    imageUrl: input.imageUrl,
    thumbnailUrl: input.thumbnailUrl,
    documentUrl: input.documentUrl,
    liveUrl: input.liveUrl,
    githubUrl: input.githubUrl,
    requiresAccessCode: Boolean(input.requiresAccessCode),
    stack: input.stack,
    featured: input.featured,
    status: input.status,
    publishedAt: input.publishedAt || new Date().toISOString().slice(0, 10),
  };

  const d1 = resolveD1Binding();
  if (d1) {
    await ensureProjectsTableD1(d1);
    const sql = `
      INSERT INTO projects (
        id, slug, title, type, summary, image_url, thumbnail_url, document_url, live_url, github_url, requires_access_code, stack_json, featured, status, order_index, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await d1
      .prepare(sql)
      .bind(
        randomUUID(),
        project.slug,
        project.title,
        project.type,
        project.summary,
        project.imageUrl ?? null,
        project.thumbnailUrl ?? null,
        project.documentUrl ?? null,
        project.liveUrl ?? null,
        project.githubUrl ?? null,
        project.requiresAccessCode ? 1 : 0,
        JSON.stringify(project.stack),
        project.featured ? 1 : 0,
        project.status,
        0,
        project.publishedAt,
      )
      .run();
    return project;
  }

  const local = await ensureLocalStore();
  local.projects.unshift(project);
  await saveLocalStore(local);
  return project;
}

export async function updateProject(
  slug: string,
  input: Partial<ProjectUpsertInput>,
): Promise<ProjectItem | null> {
  const current = await getProjectBySlug(slug);
  if (!current) return null;

  const next: ProjectItem = {
    ...current,
    title: input.title?.trim() || current.title,
    type: input.type || current.type,
    summary: input.summary?.trim() || current.summary,
    imageUrl: input.imageUrl !== undefined ? input.imageUrl : current.imageUrl,
    thumbnailUrl:
      input.thumbnailUrl !== undefined ? input.thumbnailUrl : current.thumbnailUrl,
    documentUrl:
      input.documentUrl !== undefined ? input.documentUrl : current.documentUrl,
    liveUrl: input.liveUrl !== undefined ? input.liveUrl : current.liveUrl,
    githubUrl: input.githubUrl !== undefined ? input.githubUrl : current.githubUrl,
    requiresAccessCode:
      typeof input.requiresAccessCode === "boolean"
        ? input.requiresAccessCode
        : current.requiresAccessCode,
    stack: input.stack || current.stack,
    featured: typeof input.featured === "boolean" ? input.featured : current.featured,
    status: input.status || current.status,
    publishedAt: input.publishedAt || current.publishedAt,
  };

  const d1 = resolveD1Binding();
  if (d1) {
    await ensureProjectsTableD1(d1);
    const sql = `
      UPDATE projects
      SET
        title = ?,
        type = ?,
        summary = ?,
        image_url = ?,
        thumbnail_url = ?,
        document_url = ?,
        live_url = ?,
        github_url = ?,
        requires_access_code = ?,
        stack_json = ?,
        featured = ?,
        status = ?,
        published_at = ?,
        updated_at = datetime('now')
      WHERE slug = ?
    `;
    await d1
      .prepare(sql)
      .bind(
        next.title,
        next.type,
        next.summary,
        next.imageUrl ?? null,
        next.thumbnailUrl ?? null,
        next.documentUrl ?? null,
        next.liveUrl ?? null,
        next.githubUrl ?? null,
        next.requiresAccessCode ? 1 : 0,
        JSON.stringify(next.stack),
        next.featured ? 1 : 0,
        next.status,
        next.publishedAt,
        slug,
      )
      .run();
    return next;
  }

  const local = await ensureLocalStore();
  const index = local.projects.findIndex((project) => project.slug === slug);
  if (index < 0) return null;
  local.projects[index] = next;
  await saveLocalStore(local);
  return next;
}

export async function deleteProject(slug: string): Promise<boolean> {
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureProjectsTableD1(d1);
    await d1.prepare("DELETE FROM projects WHERE slug = ?").bind(slug).run();
    return true;
  }

  const local = await ensureLocalStore();
  const before = local.projects.length;
  local.projects = local.projects.filter((project) => project.slug !== slug);
  const changed = local.projects.length !== before;
  if (changed) {
    await saveLocalStore(local);
  }
  return changed;
}
