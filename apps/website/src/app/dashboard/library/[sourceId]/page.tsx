import { SourceDetailPage } from "@/components/library/source-detail";

export const metadata = {
  title: "Source Detail",
  description: "View source details and extracted memories.",
};

export default async function SourceDetailRoute({
  params,
}: {
  params: Promise<{ sourceId: string }>;
}) {
  const { sourceId } = await params;
  return <SourceDetailPage sourceId={sourceId} />;
}
