import { createConnectorActionTool } from "../apps/website/src/server/langgraph/tools/connector-action.tool";
import { createMemoryRetrievalTool } from "../apps/website/src/server/langgraph/tools/memory-retrieval.tool";

function assertToolName(tool: { name?: string }, expectedName: string) {
  if (tool.name !== expectedName) {
    throw new Error(`Expected ${expectedName}, received ${tool.name ?? "unknown"}`);
  }
}

async function main() {
  console.log("Testing Debo LangGraph tools...");

  const userId = "test_user_123";
  const memoryTool = createMemoryRetrievalTool(userId);
  const connectorTool = createConnectorActionTool(userId);

  assertToolName(memoryTool, "retrieve_memory");
  assertToolName(connectorTool, "propose_connector_action");

  console.log("LangGraph tools initialized successfully.");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
