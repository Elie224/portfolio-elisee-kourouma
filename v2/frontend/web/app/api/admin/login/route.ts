import { NextResponse } from "next/server";
import {
  clearAdminEntryCookie,
  isValidAdminCredentials,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  if (!payload) {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }

  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "").trim();

  if (!email || !password) {
    return NextResponse.json({ error: "email et mot de passe requis" }, { status: 400 });
  }

  if (!isValidAdminCredentials(email, password)) {
    return NextResponse.json({ error: "identifiants invalides" }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  setAdminSessionCookie(response);
  clearAdminEntryCookie(response);
  return response;
}
