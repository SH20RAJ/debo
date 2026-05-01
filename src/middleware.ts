import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "./db";
import { user as userTable } from "./db/schema";
import { stackServerApp } from "./stack/server";

export default async function proxy(request: NextRequest) {
  const user = await stackServerApp.getUser();

  const isAuthPage = request.nextUrl.pathname === "/join";
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (!user) {
    if (isDashboardPage) {
      return NextResponse.redirect(new URL("/join", request.url));
    }
  } else {
    try {
      const existing = await db.query.user.findFirst({
        where: eq(userTable.id, user.id),
      });

      const now = new Date();
      const anyUser = user as any;
      const name = anyUser.name ?? anyUser.displayName ?? anyUser.primaryEmail ?? "";
      const email = anyUser.primaryEmail ?? anyUser.email ?? "";
      const image = anyUser.image ?? anyUser.avatarUrl ?? null;
      const emailVerified = Boolean(
        anyUser.emailVerified ?? anyUser.verified ?? false
      );

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
        await db
          .update(userTable)
          .set({
            name: name ?? existing.name,
            email: email ?? existing.email,
            image: image ?? existing.image,
            updatedAt: now,
          })
          .where(eq(userTable.id, user.id));
      }
    } catch {
      // Auth should not fail just because the user mirror write is temporarily unavailable.
    }

    if (isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/join"],
};
export const runtime = "experimental-edge";
