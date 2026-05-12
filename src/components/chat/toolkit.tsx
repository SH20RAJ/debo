"use client";

import { type Toolkit } from "@assistant-ui/react";
import { Plan } from "@/components/tool-ui/plan";
import { ApprovalCard } from "@/components/tool-ui/approval-card";
import { StatsDisplay } from "@/components/tool-ui/stats-display";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { CodeDiff } from "@/components/tool-ui/code-diff";
import { safeParseSerializablePlan } from "@/components/tool-ui/plan/schema";
import { safeParseSerializableApprovalCard } from "@/components/tool-ui/approval-card/schema";
import { safeParseSerializableStatsDisplay } from "@/components/tool-ui/stats-display/schema";
import { safeParseSerializableCodeBlock } from "@/components/tool-ui/code-block/schema";
import { safeParseSerializableCodeDiff } from "@/components/tool-ui/code-diff/schema";

export const toolkit: Toolkit = {
  // Progress/Planning
  showPlan: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializablePlan(result);
      if (!parsed) return null;
      return <Plan {...parsed} />;
    },
  },
  
  // Approvals
  request_approval: {
    description: "Request user approval for a consequential action.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
      },
      required: ["title", "description"],
    },
    render: ({ args, result, addResult }) => {
      const parsed = safeParseSerializableApprovalCard({
        ...args,
        choice: result === "approved" || result === "denied" ? result : undefined,
      });
      if (!parsed) return null;
      return (
        <ApprovalCard
          {...parsed}
          onConfirm={async () => addResult?.("approved")}
          onCancel={async () => addResult?.("denied")}
        />
      );
    },
  },

  // Display
  show_stats: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializableStatsDisplay(result);
      if (!parsed) return null;
      return <StatsDisplay {...parsed} />;
    },
  },

  // Artifacts
  show_code: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializableCodeBlock(result);
      if (!parsed) return null;
      return <CodeBlock {...parsed} />;
    },
  },

  show_diff: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializableCodeDiff(result);
      if (!parsed) return null;
      return <CodeDiff {...parsed} />;
    },
  },
};
