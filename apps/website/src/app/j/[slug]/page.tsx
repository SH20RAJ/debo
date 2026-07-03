import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@debo/db";
import { sources } from "@debo/db/schema";
import { and, eq, or } from "drizzle-orm";
import { Calendar, Clock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface PublicJournalPageProps {
 params: Promise<{ slug: string }>;
}

async function getSharedJournal(slug: string) {
 const [row] = await db
 .select()
 .from(sources)
 .where(
 and(
 eq(sources.slug, slug),
 eq(sources.type, "journal"),
 or(
 eq(sources.privacyLevel, "public"),
 eq(sources.privacyLevel, "unlisted")
 )
 )
 )
 .limit(1);
 return row ?? null;
}

export async function generateMetadata({
 params,
}: PublicJournalPageProps): Promise<Metadata> {
 const { slug } = await params;
 const entry = await getSharedJournal(slug);

 if (!entry) {
 return {
 title: "Entry Not Found",
 };
 }

 const isUnlisted = entry.privacyLevel === "unlisted";

 return {
 title: `${entry.title || "Untitled Entry"} Shared`,
 description: entry.summary || "A shared thought from Debo.",
 robots: isUnlisted ? "noindex, nofollow" : "index, follow",
 };
}

export default async function PublicJournalPage({ params }: PublicJournalPageProps) {
 const { slug } = await params;
 const entry = await getSharedJournal(slug);

 if (!entry) {
 notFound();
 }

 const dateLabel = entry.createdAt
 ? new Date(entry.createdAt).toLocaleDateString("en-US", {
 weekday: "long",
 month: "long",
 day: "numeric",
 year: "numeric",
 })
 : "";

 const words = entry.plainText
 ? entry.plainText.trim().split(/\s+/).filter(Boolean).length
 : 0;
 const readingTime = Math.max(1, Math.ceil(words / 200));

 return (
 <div className="min-h-screen bg-[#FBFCFA] dark:bg-[#0C0F0A] text-[#222222] dark:text-[#ECEEEC] antialiased font-sans">

 {/* Premium subtle glow background in dark mode */}
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(88,204,2,0.08),transparent_70%)] pointer-events-none" />

 {/* Header bar */}
 <header className="sticky top-0 z-30 w-full border-b border-[#EAEAEA] dark:border-[#1F261B] bg-white/70 dark:bg-[#0C0F0A]/70 backdrop-blur-xl transition-colors select-none">
 <div className="max-w-3xl mx-auto h-16 px-6 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="text-xl font-black text-[#58CC02] tracking-tight">debo.</span>
 <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-[#FAFAF7] dark:bg-[#181E15] text-[#888888] dark:text-[#808680] border border-[#EAEAEA] dark:border-[#1F261B]">
 Shared Entry
 </span>
 </div>
 <a
 href="https://debo.life"
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center rounded-xl bg-[#58CC02] text-white px-4 py-2 text-xs font-extrabold uppercase tracking-wide hover:brightness-105 shadow-[0_3px_0_#46A302] active:translate-y-[2px] active:shadow-none transition-all"
 >
 Get Debo
 </a>
 </div>
 </header>

 {/* Main content area */}
 <main className="max-w-2xl mx-auto px-6 py-16 sm:py-24 relative">
 <article className="space-y-8">

 {/* Metadata Row */}
 <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground select-none">
 {dateLabel && (
 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAEAEA] dark:border-[#1F261B] bg-white dark:bg-[#121610] shadow-sm">
 <Calendar className="w-3.5 h-3.5" />
 <span>{dateLabel}</span>
 </div>
 )}
 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAEAEA] dark:border-[#1F261B] bg-white dark:bg-[#121610] shadow-sm">
 <Clock className="w-3.5 h-3.5" />
 <span>{readingTime} min read</span>
 </div>
 {entry.privacyLevel === "unlisted" && (
 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-500 font-semibold select-none">
 <span>Unlisted Link</span>
 </div>
 )}
 </div>

 {/* Title */}
 <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-foreground">
 {entry.title || "Untitled Entry"}
 </h1>

 {/* Divider line */}
 <div className="h-px bg-[#EAEAEA] dark:bg-[#1F261B]" />

 {/* Journal Text Content */}
 <div className="prose prose-stone dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-sans text-sm sm:text-base selection:bg-[#58CC02]/20 selection:text-[#58CC02]">
 {entry.plainText || "This entry has no content."}
 </div>

 </article>

 {/* Footer branding widget */}
 <footer className="mt-20 pt-8 border-t border-[#EAEAEA] dark:border-[#1F261B] text-center select-none">
 <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#121610] border border-[#EAEAEA] dark:border-[#1F261B] shadow-sm">
 <ShieldCheck className="w-4 h-4 text-[#58CC02]" />
 <span className="text-[11px] font-bold text-muted-foreground">
 Captured securely via <a href="https://debo.life" className="text-foreground hover:underline">Debo Private Memory OS</a>
 </span>
 </div>
 </footer>

 </main>

 </div>
 );
}
