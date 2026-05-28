import { DynamicStructuredTool } from "@langchain/core/tools";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod/v3";
import { connectorActionNode } from "../nodes/connector-action.node";

const connectorActionSchema = z.object({
  provider: z.string().describe("Connector provider, such as gmail, calendar, notion, or github."),
  action: z.string().describe("The proposed connector action."),
  reason: z.string().optional().describe("Why this action may help the user."),
});

type ConnectorActionInput = z.infer<typeof connectorActionSchema>;

export function createConnectorActionTool(userId: string): StructuredToolInterface {
  return new DynamicStructuredTool({
    name: "propose_connector_action",
    description: "Create a dry-run connector action proposal that still requires user confirmation.",
    schema: connectorActionSchema as any,
    func: async ({ provider, action, reason }: ConnectorActionInput) => {
      const { connectorAction } = await connectorActionNode({
        userId,
        confirmed: false,
        plan: {
          provider,
          action,
          reason,
          arguments: {},
        },
      });

      return connectorAction;
    },
  });
}
