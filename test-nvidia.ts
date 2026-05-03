import OpenAI from "openai";
import * as fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envContent.match(/OPENAI_API_KEY=(.*)/);
const key = keyMatch ? keyMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';

const client = new OpenAI({
  apiKey: key,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main() {
  try {
    const res = await client.chat.completions.create({
      model: "meta/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    });
    console.log("Success:", res.choices[0].message);
  } catch (e: any) {
    console.error("Error:", e.status, e.message);
  }
}
main();
