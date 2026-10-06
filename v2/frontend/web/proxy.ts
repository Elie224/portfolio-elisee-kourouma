import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_ENTRY_COOKIE,
  ADMIN_SESSION_COOKIE,
  isValidAdminEntryToken,
  isValidAdminSessionCookie,
} from "@/lib/admin-auth";

function isProtectedAdminPage(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

function isProtectedAdminApi(pathname: string): boolean {
  return pathname.startsWith("/api/admin");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedAdminPage(pathname) && !isProtectedAdminApi(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const entryCookie = request.cookies.get(ADMIN_ENTRY_COOKIE)?.value;
  const hasEntry = isValidAdminEntryToken(entryCookie);
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isValidAdminSessionCookie(sessionCookie)) {
    return NextResponse.next();
  }

  if ((isLoginPage || isLoginApi) && hasEntry) {
    return NextResponse.next();
  }

  if (isProtectedAdminApi(pathname)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const loginUrl = new URL("/admin/login", request.url);
  const nextPath = `${pathname}${search}`;
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
