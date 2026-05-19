import { PersonDetail } from "@/components/people/person-detail";

export const metadata = {
  title: "Person | Debo",
};

export default async function PersonDetailRoute({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  return <PersonDetail personId={personId} />;
}
