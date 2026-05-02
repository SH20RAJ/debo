import { NextResponse, type NextRequest } from "next/server";
import { getUserId } from "@/actions/auth-sync";

export default async function proxy(request: NextRequest) {
  const userId = await getUserId();

  const isAuthPage = request.nextUrl.pathname === "/join";
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (!userId) {
    if (isDashboardPage) {
      return NextResponse.redirect(new URL("/join", request.url));
    }
  } else {
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/join"],
};
