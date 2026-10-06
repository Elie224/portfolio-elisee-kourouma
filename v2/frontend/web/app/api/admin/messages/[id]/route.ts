import { NextResponse } from "next/server";
import { deleteMessage, getMessageById, setMessageRead } from "@/lib/messages-store";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const message = await getMessageById(id);

  if (!message) {
    return NextResponse.json({ error: "message not found" }, { status: 404 });
  }

  return NextResponse.json({ message });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await request.json().catch(() => null)) as { read?: unknown } | null;
  const read = payload && typeof payload.read === "boolean" ? payload.read : true;
  const message = await setMessageRead(id, read);

  if (!message) {
    return NextResponse.json({ error: "message not found" }, { status: 404 });
  }

  return NextResponse.json({ message });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteMessage(id);

  if (!deleted) {
    return NextResponse.json({ error: "message not found" }, { status: 404 });
  }

  return NextResponse.json({ deleted: true, id });
}
