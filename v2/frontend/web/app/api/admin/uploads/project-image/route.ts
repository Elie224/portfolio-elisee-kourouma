import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";

interface R2Like {
  put: (
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string } },
  ) => Promise<unknown>;
  delete?: (key: string) => Promise<unknown>;
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const LOCAL_PREFIX = "/uploads/projects/";

function resolvePublicBaseUrl(): string | null {
  const raw = (process.env.PROJECT_IMAGES_PUBLIC_BASE_URL || "").trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

function resolveR2Bucket(): R2Like | null {
  const g = globalThis as unknown as {
    PROJECT_IMAGES_BUCKET?: R2Like;
    env?: { PROJECT_IMAGES_BUCKET?: R2Like };
    __env?: { PROJECT_IMAGES_BUCKET?: R2Like };
  };

  return g.PROJECT_IMAGES_BUCKET ?? g.env?.PROJECT_IMAGES_BUCKET ?? g.__env?.PROJECT_IMAGES_BUCKET ?? null;
}

function getR2KeyFromUrl(url: string): string | null {
  const publicBaseUrl = resolvePublicBaseUrl();
  if (!publicBaseUrl) return null;
  if (!url.startsWith(`${publicBaseUrl}/`)) return null;
  const key = url.slice(publicBaseUrl.length + 1).trim();
  return key || null;
}

function getLocalFilePathFromUrl(url: string): string | null {
  if (!url.startsWith(LOCAL_PREFIX)) return null;
  const name = path.basename(url);
  if (!name) return null;
  return path.join(process.cwd(), "public", "uploads", "projects", name);
}

function getExtension(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "fichier image requis" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: "format image non supporte" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "image trop volumineuse (max 5MB)" }, { status: 400 });
  }

  const ext = getExtension(file.type);
  const key = `projects/${Date.now()}-${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const localDir = path.join(process.cwd(), "public", "uploads", "projects");
  await mkdir(localDir, { recursive: true });
  const localPath = path.join(localDir, `${Date.now()}-${randomUUID()}.${ext}`);
  await writeFile(localPath, bytes);

  const localFileName = path.basename(localPath);
  const localUrl = `/uploads/projects/${localFileName}`;

  let mirroredToR2 = false;
  const bucket = resolveR2Bucket();
  if (bucket) {
    try {
      await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });
      mirroredToR2 = true;
    } catch {
      mirroredToR2 = false;
    }
  }

  const publicBaseUrl = resolvePublicBaseUrl();
  const publicR2Url = mirroredToR2 && publicBaseUrl ? `${publicBaseUrl}/${key}` : null;
  const finalUrl = publicR2Url || localUrl;

  return NextResponse.json({
    url: finalUrl,
    localUrl,
    publicUrl: publicR2Url,
    contentType: file.type,
    size: file.size,
    r2Key: mirroredToR2 ? key : null,
    mirroredToR2,
  });
}

export async function DELETE(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { url?: string }
    | null;
  const url = String(payload?.url || "").trim();

  if (!url) {
    return NextResponse.json({ error: "url image requise" }, { status: 400 });
  }

  let localDeleted = false;
  const localPath = getLocalFilePathFromUrl(url);
  if (localPath) {
    try {
      await unlink(localPath);
      localDeleted = true;
    } catch {
      localDeleted = false;
    }
  }

  let r2Deleted = false;
  const bucket = resolveR2Bucket();
  const r2Key = getR2KeyFromUrl(url);
  if (bucket && r2Key && typeof bucket.delete === "function") {
    try {
      await bucket.delete(r2Key);
      r2Deleted = true;
    } catch {
      r2Deleted = false;
    }
  }

  return NextResponse.json({
    ok: true,
    localDeleted,
    r2Deleted,
  });
}
