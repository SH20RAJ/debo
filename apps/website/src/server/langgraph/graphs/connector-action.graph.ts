import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { connectorActionNode } from "../nodes/connector-action.node";
import type {
  ConnectorActionPlan,
  ConnectorActionResult,
} from "../schemas/connector-action.schema";

const ConnectorActionState = Annotation.Root({
  userId: Annotation<string>(),
  plan: Annotation<ConnectorActionPlan>(),
  confirmed: Annotation<boolean | undefined>(),
  connectorAction: Annotation<ConnectorActionResult | undefined>(),
});

export const connectorActionGraph = new StateGraph(ConnectorActionState)
  .addNode("connectorAction", connectorActionNode)
  .addEdge(START, "connectorAction")
  .addEdge("connectorAction", END)
  .compile();

export async function proposeConnectorAction(input: {
  userId: string;
  plan: ConnectorActionPlan;
  confirmed?: boolean;
}) {
  const result = await connectorActionGraph.invoke(input);
  return result.connectorAction as ConnectorActionResult;
}
