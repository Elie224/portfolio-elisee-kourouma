import { NextResponse } from "next/server";
import {
  createProject,
  listAllProjects,
  type ProjectUpsertInput,
} from "@/lib/projects-store";
import { PROJECT_TYPES, type ProjectType } from "@/app/content";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";

function isValidProjectType(input: string): input is ProjectType {
  return PROJECT_TYPES.includes(input as ProjectType);
}

function parseStack(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  if (!clean) return undefined;
  if (clean.startsWith("/") || clean.startsWith("https://") || clean.startsWith("http://")) {
    return clean.slice(0, 500);
  }
  return undefined;
}

function parseDocumentUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  if (!clean) return undefined;
  if (clean.startsWith("/") || clean.startsWith("https://") || clean.startsWith("http://")) {
    return clean.slice(0, 500);
  }
  return undefined;
}

function parseExternalUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  if (!clean) return undefined;
  if (clean.startsWith("https://") || clean.startsWith("http://")) {
    return clean.slice(0, 500);
  }
  return undefined;
}

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const status = (url.searchParams.get("status") || "all").trim();
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("pageSize") || "6")),
  );

  const projects = await listAllProjects();
  const filtered = projects.filter((project) => {
    if (status !== "all" && project.status !== status) return false;
    if (!q) return true;
    const haystack = [project.title, project.summary, project.type, ...project.stack]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    total,
    page: safePage,
    pageSize,
    pageCount,
    projects: pageItems,
  });
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | Partial<ProjectUpsertInput>
    | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }

  const title = String(payload.title || "").trim();
  const type = String(payload.type || "").trim();
  const summary = String(payload.summary || "").trim();
  const imageUrl = parseImageUrl(payload.imageUrl);
  const thumbnailUrl = parseImageUrl(payload.thumbnailUrl);
  const documentUrl = parseDocumentUrl(payload.documentUrl);
  const liveUrl = parseExternalUrl(payload.liveUrl);
  const githubUrl = parseExternalUrl(payload.githubUrl);
  const requiresAccessCode = Boolean(payload.requiresAccessCode);
  const status = payload.status === "draft" ? "draft" : "published";
  const stack = parseStack(payload.stack);
  const featured = Boolean(payload.featured);
  const publishedAt = String(payload.publishedAt || "").trim();

  if (!title || !summary || !type) {
    return NextResponse.json(
      { error: "title, type et summary sont requis" },
      { status: 400 },
    );
  }

  if (!isValidProjectType(type)) {
    return NextResponse.json({ error: "type projet invalide" }, { status: 400 });
  }

  const created = await createProject({
    title,
    type,
    summary,
    imageUrl,
    thumbnailUrl,
    documentUrl,
    liveUrl,
    githubUrl,
    requiresAccessCode,
    stack,
    featured,
    status,
    publishedAt: publishedAt || undefined,
  });

  return NextResponse.json({ project: created }, { status: 201 });
}
