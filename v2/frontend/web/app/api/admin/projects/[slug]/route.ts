import { NextResponse } from "next/server";
import {
  deleteProject,
  getProjectBySlug,
  updateProject,
  type ProjectUpsertInput,
} from "@/lib/projects-store";
import { PROJECT_TYPES, type ProjectType } from "@/app/content";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";

function isValidProjectType(input: string): input is ProjectType {
  return PROJECT_TYPES.includes(input as ProjectType);
}

function parseStack(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;

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
  if (value === undefined || value === null) return undefined;
  const clean = String(value).trim();
  if (!clean) return "";
  if (clean.startsWith("/") || clean.startsWith("https://") || clean.startsWith("http://")) {
    return clean.slice(0, 500);
  }
  return undefined;
}

function parseDocumentUrl(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const clean = String(value).trim();
  if (!clean) return "";
  if (clean.startsWith("/") || clean.startsWith("https://") || clean.startsWith("http://")) {
    return clean.slice(0, 500);
  }
  return undefined;
}

function parseExternalUrl(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const clean = String(value).trim();
  if (!clean) return "";
  if (clean.startsWith("https://") || clean.startsWith("http://")) {
    return clean.slice(0, 500);
  }
  return undefined;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const payload = (await request.json().catch(() => null)) as
    | Partial<ProjectUpsertInput>
    | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }

  const patch: Partial<ProjectUpsertInput> = {};

  if (payload.title !== undefined) patch.title = String(payload.title || "").trim();
  if (payload.summary !== undefined) {
    patch.summary = String(payload.summary || "").trim();
  }
  if (payload.type !== undefined) {
    const type = String(payload.type || "").trim();
    if (!isValidProjectType(type)) {
      return NextResponse.json({ error: "type projet invalide" }, { status: 400 });
    }
    patch.type = type;
  }
  if (payload.stack !== undefined) {
    patch.stack = parseStack(payload.stack);
  }
  if (payload.imageUrl !== undefined) {
    const parsedImageUrl = parseImageUrl(payload.imageUrl);
    patch.imageUrl = parsedImageUrl === "" ? undefined : parsedImageUrl;
  }
  if (payload.thumbnailUrl !== undefined) {
    const parsedThumbnailUrl = parseImageUrl(payload.thumbnailUrl);
    patch.thumbnailUrl = parsedThumbnailUrl === "" ? undefined : parsedThumbnailUrl;
  }
  if (payload.documentUrl !== undefined) {
    const parsedDocumentUrl = parseDocumentUrl(payload.documentUrl);
    patch.documentUrl = parsedDocumentUrl === "" ? undefined : parsedDocumentUrl;
  }
  if (payload.liveUrl !== undefined) {
    const parsedLiveUrl = parseExternalUrl(payload.liveUrl);
    patch.liveUrl = parsedLiveUrl === "" ? undefined : parsedLiveUrl;
  }
  if (payload.githubUrl !== undefined) {
    const parsedGithubUrl = parseExternalUrl(payload.githubUrl);
    patch.githubUrl = parsedGithubUrl === "" ? undefined : parsedGithubUrl;
  }
  if (payload.requiresAccessCode !== undefined) {
    patch.requiresAccessCode = Boolean(payload.requiresAccessCode);
  }
  if (payload.featured !== undefined) {
    patch.featured = Boolean(payload.featured);
  }
  if (payload.status !== undefined) {
    patch.status = payload.status === "draft" ? "draft" : "published";
  }
  if (payload.publishedAt !== undefined) {
    patch.publishedAt = String(payload.publishedAt || "").trim();
  }

  const updated = await updateProject(slug, patch);
  if (!updated) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  return NextResponse.json({ project: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const deleted = await deleteProject(slug);

  if (!deleted) {
    return NextResponse.json({ error: "project not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true, slug });
}
