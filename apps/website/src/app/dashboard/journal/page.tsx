import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { JournalPage } from "@/components/journal/journal-page";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Journal",
  description: "Write, reflect, and capture your thoughts.",
};

export default async function JournalRoute() {
  let userId = "dev-user-001";
  const STACK_CONFIGURED =
    Boolean(process.env.NEXT_PUBLIC_STACK_PROJECT_ID) &&
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID !== "ffffffff-ffff-ffff-ffff-ffffffffffff";

  if (STACK_CONFIGURED) {
    const user = await stackServerApp.getUser();
    if (!user) {
      redirect("/handler/sign-in");
    }
    userId = user.id;
  } else if (process.env.NODE_ENV === "production") {
    redirect("/handler/sign-in");
  }

  // Fetch initial journal entries on the server
  const dbEntries = await db
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.userId, userId),
        eq(sources.workspaceId, userId),
        inArray(sources.type, ["journal", "audio", "video"]),
        ne(sources.status, "deleted")
      )
    )
    .orderBy(desc(sources.createdAt));

  function makePreview(content: string): string {
    const text = (content ?? "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    return text.length > 140 ? text.slice(0, 140) + "..." : text;
  }

  const initialEntries = dbEntries.map((s) => {
    const content = s.plainText ?? s.summary ?? "";
    return {
      id: s.id,
      title: s.title ?? "",
      preview: makePreview(content),
      content,
      createdAt: String(s.createdAt),
      updatedAt: String(s.updatedAt),
      slug: s.slug ?? "",
      privacyLevel: s.privacyLevel ?? "normal",
      type: s.type,
      metadataJson: s.metadataJson ?? undefined,
    };
  });

  return <JournalPage fallbackData={initialEntries as any} />;
}
