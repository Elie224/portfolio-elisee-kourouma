import { NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-auth";
import {
  getPortfolioContent,
  savePortfolioContent,
} from "@/lib/portfolio-content-store";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const content = await getPortfolioContent();
  return NextResponse.json({ content });
}

export async function PATCH(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as { content?: unknown } | null;
  if (!payload || payload.content === undefined) {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }

  const content = await savePortfolioContent(payload.content);
  return NextResponse.json({ content });
}
