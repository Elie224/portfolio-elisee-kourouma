import { NextResponse } from "next/server";
import {
  isValidAdminEntryToken,
  setAdminEntryCookie,
} from "@/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!isValidAdminEntryToken(token)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  setAdminEntryCookie(response);
  return response;
}
