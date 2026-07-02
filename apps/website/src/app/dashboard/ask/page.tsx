import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; threadId?: string }>;
}

export default async function AskDeboPage({ searchParams }: PageProps) {
  const params = await searchParams;
  if (params.threadId) {
    const urlParams = new URLSearchParams();
    if (params.q) {
      urlParams.set("q", params.q);
    }
    const queryStr = urlParams.toString();
    redirect(`/dashboard/chat/${params.threadId}${queryStr ? `?${queryStr}` : ""}`);
  }
  const urlParams = new URLSearchParams();
  if (params.q) {
    urlParams.set("q", params.q);
  }
  const queryStr = urlParams.toString();
  redirect(`/dashboard/chat${queryStr ? `?${queryStr}` : ""}`);
}
