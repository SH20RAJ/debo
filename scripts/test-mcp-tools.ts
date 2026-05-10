import { mcpDeboTools } from '../src/mastra/tools/debo-tools';

async function main() {
    console.log("Testing Mastra MCP tools...");
    const mockContext = { mcp: { elicitation: {}, extra: { authInfo: { userId: "test_user_123" } } } } as any;

    try {
        console.log("1. Testing getJournalsTool...");
        const journals = await mcpDeboTools.getJournalsTool.execute!({ limit: 1 }, mockContext);
        console.log("Success!", journals);

        console.log("2. Testing getMemoriesTool...");
        const memories = await mcpDeboTools.getMemoriesTool.execute!({ limit: 1 }, mockContext);
        console.log("Success!", memories);

        console.log("\nAll MCP tools initialized and basic methods execute successfully.");
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}
main();
