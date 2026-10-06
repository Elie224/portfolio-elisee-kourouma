import { NextResponse } from "next/server";
import { listMessages } from "@/lib/messages-store";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") || "100");
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, limitRaw)) : 100;

  const messages = await listMessages(limit);
  const unread = messages.filter((item) => !item.readAt).length;

  return NextResponse.json({
    total: messages.length,
    unread,
    messages,
  });
}
