import { TasksPage } from "@/components/tasks/tasks-page";

export const metadata = {
  title: "Tasks",
  description: "Your tasks extracted from memory.",
};

export default function TasksRoute() {
  return <TasksPage />;
}
