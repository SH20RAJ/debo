import { TasksPage } from "@/components/tasks/tasks-page";

export const metadata = {
  title: "Tasks | Debo",
  description: "Your tasks extracted from memory.",
};

export default function TasksRoute() {
  return <TasksPage />;
}
