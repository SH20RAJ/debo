import { NextResponse, type NextRequest } from "next/server";
import { stackServerApp } from "./stack/server";

export default async function middleware(request: NextRequest) {
    const user = await stackServerApp.getUser();

	const isAuthPage = request.nextUrl.pathname === "/join" || request.nextUrl.pathname === "/login";
	const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

	if (!user) {
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
	matcher: ["/dashboard/:path*", "/join", "/login"],
};
