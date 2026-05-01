import { NextResponse, type NextRequest } from "next/server";
import { stackServerApp } from "./stack/server";
import { db } from "./db";
import { user as userTable } from "./db/schema";
import { eq } from "drizzle-orm";

export default async function middleware(request: NextRequest) {
	const user = await stackServerApp.getUser();

	const isAuthPage = request.nextUrl.pathname === "/join" || request.nextUrl.pathname === "/login";
	const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

	if (!user) {
		if (isDashboardPage) {
			return NextResponse.redirect(new URL("/join", request.url));
		}
	} else {
		// Ensure the authenticated user exists in our Postgres DB
		try {
			const existing = await db.query.user.findFirst({ where: eq(userTable.id, user.id) });

			const now = new Date();
			const anyUser = user as any;
			const name = anyUser.name ?? anyUser.displayName ?? anyUser.primaryEmail ?? "";
			const email = anyUser.primaryEmail ?? anyUser.email ?? "";
			const image = anyUser.image ?? anyUser.avatarUrl ?? null;
			const emailVerified = Boolean(anyUser.emailVerified ?? anyUser.verified ?? false);

			if (!existing) {
				await db.insert(userTable).values({
					id: user.id,
					name,
					email,
					emailVerified,
					image,
					createdAt: now,
					updatedAt: now,
				});
			} else {
				await db.update(userTable).set({
					name: name ?? existing.name,
					email: email ?? existing.email,
					image: image ?? existing.image,
					updatedAt: now,
				}).where(eq(userTable.id, user.id));
			}
		} catch (err) {
			// Swallow DB errors here; auth still proceeds. Log server-side if needed.
			// console.error('User sync error', err);
		}

		if (isAuthPage) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/join", "/login"],
};
