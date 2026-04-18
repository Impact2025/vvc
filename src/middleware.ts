import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("vvc_admin_session");
    if (!session || session.value !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/scorekeeper") && !pathname.startsWith("/scorekeeper/login")) {
    const session = request.cookies.get("vvc_scorekeeper_session");
    if (!session || session.value !== process.env.SCOREKEEPER_SECRET) {
      return NextResponse.redirect(new URL("/scorekeeper/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/scorekeeper/:path*"],
};
