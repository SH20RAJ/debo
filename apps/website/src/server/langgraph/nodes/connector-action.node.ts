import type {
  ConnectorActionPlan,
  ConnectorActionResult,
} from "../schemas/connector-action.schema";

export async function connectorActionNode(state: {
  userId: string;
  plan: ConnectorActionPlan;
  confirmed?: boolean;
}): Promise<{ connectorAction: ConnectorActionResult }> {
  const result: ConnectorActionResult = {
    status: state.confirmed ? "not_configured" : "requires_confirmation",
    provider: state.plan.provider,
    action: state.plan.action,
    message: state.confirmed
      ? "Connector execution is not wired yet. The validated action plan was not sent."
      : "Connector actions require explicit user confirmation before execution.",
    dryRun: true,
  };

  return { connectorAction: result };
}
