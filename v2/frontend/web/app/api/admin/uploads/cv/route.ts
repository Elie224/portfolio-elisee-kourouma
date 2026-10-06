import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";

const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const LOCAL_PREFIX = "/uploads/cv/";

function getExtension(contentType: string): string {
  switch (contentType) {
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return "bin";
  }
}

function getLocalFilePathFromUrl(url: string): string | null {
  if (!url.startsWith(LOCAL_PREFIX)) return null;
  const name = path.basename(url);
  if (!name) return null;
  return path.join(process.cwd(), "public", "uploads", "cv", name);
}

export async function POST(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "fichier CV requis" }, { status: 400 });
  }

  if (!ALLOWED_DOC_TYPES.has(file.type)) {
    return NextResponse.json({ error: "format CV non supporte" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "CV trop volumineux (max 12MB)" }, { status: 400 });
  }

  const ext = getExtension(file.type);
  const localDir = path.join(process.cwd(), "public", "uploads", "cv");
  await mkdir(localDir, { recursive: true });

  const localPath = path.join(localDir, `${Date.now()}-${randomUUID()}.${ext}`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(localPath, bytes);

  const localFileName = path.basename(localPath);
  const localUrl = `/uploads/cv/${localFileName}`;

  return NextResponse.json({
    url: localUrl,
    contentType: file.type,
    size: file.size,
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
    return NextResponse.json({ error: "url CV requise" }, { status: 400 });
  }

  const localPath = getLocalFilePathFromUrl(url);
  if (!localPath) {
    return NextResponse.json({ error: "url CV invalide" }, { status: 400 });
  }

  let localDeleted = false;
  try {
    await unlink(localPath);
    localDeleted = true;
  } catch {
    localDeleted = false;
  }

  return NextResponse.json({ ok: true, localDeleted });
}
