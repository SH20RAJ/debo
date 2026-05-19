"use client";

import { useCopilotAction } from "@copilotkit/react-core";

export function CopilotActions() {
  useCopilotAction({
    name: "createTask",
    description: "Create a new task for the user",
    parameters: [
      { name: "title", type: "string", description: "Task title", required: true },
      { name: "dueDate", type: "string", description: "Due date (ISO string)", required: false },
      { name: "relatedPerson", type: "string", description: "Related person name", required: false },
    ],
    handler: async ({ title, dueDate, relatedPerson }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueAt: dueDate, relatedPerson }),
      });
      return await res.json();
    },
  });

  useCopilotAction({
    name: "createJournal",
    description: "Create a new journal entry",
    parameters: [
      { name: "title", type: "string", description: "Journal title", required: true },
      { name: "content", type: "string", description: "Journal content", required: true },
    ],
    handler: async ({ title, content }) => {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "journal", title, description: content }),
      });
      return await res.json();
    },
  });

  useCopilotAction({
    name: "searchMemory",
    description: "Search the user's memory for information",
    parameters: [
      { name: "query", type: "string", description: "Search query", required: true },
    ],
    handler: async ({ query }) => {
      const res = await fetch("/api/sources?q=" + encodeURIComponent(query));
      return await res.json();
    },
  });

  useCopilotAction({
    name: "getPeople",
    description: "Get list of people in the user's memory",
    parameters: [],
    handler: async () => {
      const res = await fetch("/api/people");
      return await res.json();
    },
  });

  useCopilotAction({
    name: "getTasks",
    description: "Get list of the user's tasks",
    parameters: [
      { name: "status", type: "string", description: "Filter by status", required: false },
    ],
    handler: async ({ status }) => {
      const url = status ? "/api/tasks?status=" + status : "/api/tasks";
      const res = await fetch(url);
      return await res.json();
    },
  });

  useCopilotAction({
    name: "draftMessage",
    description: "Draft a Debo Mail message",
    parameters: [
      { name: "to", type: "string", description: "Recipient username", required: true },
      { name: "subject", type: "string", description: "Subject", required: true },
      { name: "body", type: "string", description: "Message body", required: true },
    ],
    handler: async ({ to, subject, body }) => {
      return { to: to + "@debo.life", subject, body, status: "drafted" };
    },
  });

  useCopilotAction({
    name: "openSource",
    description: "Open and display a source by ID",
    parameters: [
      { name: "sourceId", type: "string", description: "Source ID", required: true },
    ],
    handler: async ({ sourceId }) => {
      const res = await fetch("/api/sources/" + sourceId);
      return await res.json();
    },
  });

  useCopilotAction({
    name: "getProjects",
    description: "Get list of the user's projects",
    parameters: [],
    handler: async () => {
      const res = await fetch("/api/projects");
      return await res.json();
    },
  });

  useCopilotAction({
    name: "getConnectors",
    description: "Get list of connected apps and connectors",
    parameters: [],
    handler: async () => {
      const res = await fetch("/api/connectors");
      return await res.json();
    },
  });

  return null;
}
