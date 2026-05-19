import type { ProjectMemory } from "../types";

export const PROJECTS: ProjectMemory[] = [
  {
    id: "proj-001",
    name: "Debo",
    description:
      "Private memory operating system. Capture anything, ask your past, trust every answer.",
    pinnedMemories: 4,
    openTasks: 5,
    people: ["Alex", "Marcus", "Priya", "Sarah"],
  },
  {
    id: "proj-002",
    name: "Q4 Budget",
    description:
      "Marketing budget planning for Q4. Covers digital, events, and content allocations.",
    pinnedMemories: 2,
    openTasks: 2,
    people: ["Raj"],
  },
  {
    id: "proj-003",
    name: "Content Ideas",
    description:
      "Blog posts, social content, and thought leadership pieces for the Debo brand.",
    pinnedMemories: 1,
    openTasks: 1,
    people: ["Marcus"],
  },
];
