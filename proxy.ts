import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ROUTES } from "@/shared/constants";

const AUTH_ROUTES: string[] = [ROUTES.LOGIN, ROUTES.SIGNUP];

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/routines/:path*",
    "/workout/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
