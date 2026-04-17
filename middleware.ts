import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isSalesBlockedPath } from "@/lib/auth/access";
import type { UserRole } from "@/generated/prisma/enums";

/**
 * Edge-safe auth gate: decode JWT only (no Prisma). Must stay in sync with
 * session JWT claims set in `auth.ts` (`role`, etc.).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  /** Leads ingest uses `x-api-key` + `LEADS_API_KEY` in the route handler, not session JWT. */
  if (pathname.startsWith("/api/leads")) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (pathname === "/login") return NextResponse.next();
    return NextResponse.json(
      { error: "AUTH_SECRET is not configured" },
      { status: 500 },
    );
  }

  const isHttps = request.nextUrl.protocol === "https:";
  const token = await getToken({
    req: request,
    secret,
    secureCookie: isHttps,
  });

  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const role = token.role as UserRole | undefined;
  if (role === "SALES" && isSalesBlockedPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") && role !== "DIRECTOR") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Keep _next/data matched (auth on client navigations). Exclude static, image
    // optimizer, webpack HMR, and Next dev/overlay internals — otherwise those
    // requests can hit the auth gate and break dev assets or tooling.
    "/((?!api/auth|_next/static|_next/image|_next/webpack|__nextjs|favicon.ico|.*\\.(?:ico|png|svg|webp|jpg|jpeg|gif|woff2?)$).*)",
  ],
};
