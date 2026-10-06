import { NextResponse } from "next/server";

type Payload = {
  code?: string;
};

function getReportsAccessCode(): string {
  const value = process.env.REPORTS_ACCESS_CODE;
  return value && value.trim().length > 0 ? value.trim() : "";
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Payload | null;

  if (!payload) {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }

  const provided = String(payload.code || "").trim();
  const expected = getReportsAccessCode();

  if (!expected) {
    return NextResponse.json(
      { error: "code de telechargement non configure" },
      { status: 503 },
    );
  }

  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "code invalide" }, { status: 401 });
  }

  return NextResponse.json({ authorized: true });
}
