import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; threadId?: string }>;
}

export default async function AskDeboPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  if (params.q) {
    urlParams.set("q", params.q);
  }
  if (params.threadId) {
    urlParams.set("threadId", params.threadId);
  }
  const queryStr = urlParams.toString();
  redirect(`/dashboard/chat${queryStr ? `?${queryStr}` : ""}`);
}
