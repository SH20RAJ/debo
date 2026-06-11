import { PeoplePage } from "@/components/people/people-page";

export const metadata = {
  title: "People",
  description: "People mentioned in your memories.",
};

export default function PeopleRoute() {
  return <PeoplePage />;
}
