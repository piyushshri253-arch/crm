import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const userId = req.cookies.get("user_id")?.value;

  const isLoginPage = req.nextUrl.pathname === "/login";

  // ❌ Not logged in → force login
  if (!userId && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ❌ logged in user should not go login page
  if (userId && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/reports/:path*", "/settings/:path*"],
};