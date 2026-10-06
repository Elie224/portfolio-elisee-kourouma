import type { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "portfolio_admin_session";
export const ADMIN_ENTRY_COOKIE = "portfolio_admin_entry";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const ENTRY_MAX_AGE_SECONDS = 60 * 10;

function getEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

export function getAdminEmail(): string {
  return getEnv("ADMIN_EMAIL", "admin@portfolio.local").toLowerCase();
}

export function getAdminPassword(): string {
  return getEnv("ADMIN_PASSWORD", "change-me");
}

export function getAdminSessionToken(): string {
  return getEnv("ADMIN_SESSION_TOKEN", "dev-admin-session-token");
}

export function getAdminEntryToken(): string {
  return getEnv("ADMIN_ENTRY_TOKEN", "dev-admin-entry-token");
}

export function isValidAdminCredentials(email: string, password: string): boolean {
  return (
    String(email || "").trim().toLowerCase() === getAdminEmail() &&
    String(password || "").trim() === getAdminPassword()
  );
}

export function isValidAdminSessionCookie(value?: string): boolean {
  return Boolean(value) && value === getAdminSessionToken();
}

export function isValidAdminEntryToken(value?: string): boolean {
  return Boolean(value) && value === getAdminEntryToken();
}

function readCookieValue(cookieHeader: string, key: string): string | undefined {
  const chunks = cookieHeader.split(";").map((part) => part.trim());
  for (const chunk of chunks) {
    const [name, ...rest] = chunk.split("=");
    if (name === key) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}

export function isAdminRequestAuthorized(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const session = readCookieValue(cookieHeader, ADMIN_SESSION_COOKIE);
  return isValidAdminSessionCookie(session);
}

export function setAdminEntryCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_ENTRY_COOKIE,
    value: getAdminEntryToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ENTRY_MAX_AGE_SECONDS,
  });
}

export function clearAdminEntryCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_ENTRY_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function setAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: getAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
