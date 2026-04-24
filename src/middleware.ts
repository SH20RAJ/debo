import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

// Define a minimal Session type for the middleware
interface Session {
    user: {
        id: string;
        email: string;
    };
    session: {
        id: string;
        expiresAt: Date;
    };
}

export default async function middleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>(
		"/api/auth/get-session",
		{
			baseURL: request.nextUrl.origin,
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		},
	);

	const isAuthPage = request.nextUrl.pathname === "/join" || request.nextUrl.pathname === "/login";
	const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

	if (!session) {
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
