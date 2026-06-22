import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { createNvidiaLLM } from "@/server/langgraph/nodes/generate-answer.node";
import { newId } from "@/lib/api-helpers";

export interface ParsedAutomation {
  id: string;
  type: "schedule" | "trigger";
  triggerDescription: string;
  time?: string; // "HH:MM" format
  triggerKeyword?: string; // Keyword triggers (e.g. "sleep")
  entityId: string;
  state: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export async function parseAutomationInstruction(
  instruction: string
): Promise<ParsedAutomation | null> {
  const llm = createNvidiaLLM(false);
  if (!llm) {
    throw new Error("LLM provider is not configured. Set NVIDIA_API_KEY or OPENAI_API_KEY.");
  }

  const systemPrompt = `You are a structured parser for smart home automations in Debo (a private memory OS).
Your task is to analyze the user's natural language instruction and output a JSON block that defines the automation configuration.

Available Devices & Entity IDs:
- "light.living_room" (Living Room Light/bulb/lamp - supports states: "on", "off", brightness 0-255)
- "switch.kitchen_fan" (Kitchen Fan/ventilator - supports states: "on", "off")
- "lock.front_door" (Front Door Lock - supports states: "lock", "unlock")
- "climate.thermostat" (Thermostat/AC - supports states: "heat", "cool", and setting temperature)

Types of Automations:
1. "schedule": Triggers at a specific time of day (e.g., "turn off the fan at 10 PM", "lights on at 7:00").
2. "trigger": Triggers when the user journals about a specific topic (e.g., "lock the door when I write about going to bed", "turn off lights if I journal about leaving").

JSON Output Schema:
{
  "type": "schedule" | "trigger",
  "triggerDescription": "At 10:00 PM daily" OR "When I journal about sleeping",
  "time": "HH:MM" (string in 24h format, required for schedule),
  "triggerKeyword": "lowercase_single_keyword" (string, required for trigger, e.g. "sleep", "leave", "cook"),
  "entityId": "light.living_room" | "switch.kitchen_fan" | "lock.front_door" | "climate.thermostat",
  "state": "on" | "off" | "lock" | "unlock" | "heat" | "cool",
  "description": "Human-readable summary of the automation"
}

Examples:
Input: "turn off kitchen fan at 11 PM"
Output:
{
  "type": "schedule",
  "triggerDescription": "At 23:00 daily",
  "time": "23:00",
  "entityId": "switch.kitchen_fan",
  "state": "off",
  "description": "Turn off Kitchen Fan at 11:00 PM"
}

Input: "lock front door when I write a journal about leaving the house"
Output:
{
  "type": "trigger",
  "triggerDescription": "When journaling about 'leave'",
  "triggerKeyword": "leave",
  "entityId": "lock.front_door",
  "state": "lock",
  "description": "Lock Front Door when journal contains 'leave'"
}

Return ONLY the raw JSON block. Do not include markdown code fences (\`\`\`json), comments, or extra text. Output exactly the raw JSON.`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(instruction),
    ]);

    const content = (response.content as string).trim();
    // Clean up any potential markdown fences in case model violates instructions
    const cleanJson = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    
    const parsed = JSON.parse(cleanJson);
    
    return {
      id: newId("auto"),
      type: parsed.type,
      triggerDescription: parsed.triggerDescription,
      time: parsed.time ?? undefined,
      triggerKeyword: parsed.triggerKeyword ? parsed.triggerKeyword.toLowerCase().trim() : undefined,
      entityId: parsed.entityId,
      state: parsed.state,
      description: parsed.description || instruction,
      active: true,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[parseAutomationInstruction] Failed to parse automation:", err);
    return null;
  }
}
