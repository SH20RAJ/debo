import { ProjectsPage } from "@/components/projects/projects-page";

export const metadata = {
  title: "Projects",
  description: "Your projects grouped by ongoing work.",
};

export default function ProjectsRoute() {
  return <ProjectsPage />;
}
