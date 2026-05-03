import { mastra } from "./src/mastra/index.js";
async function main() {
  const agent = mastra.getAgent("debo");
  try {
    const res = await agent.generate("hello");
    console.log("Success:", res.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
