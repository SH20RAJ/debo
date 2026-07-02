async function test() {
  const apiKey = "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";
  
  console.log("Testing embeddings...");
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: "Hello world",
        model: "nvidia/llama-nemotron-embed-1b-v2",
        input_type: "query"
      })
    });
    console.log("Embeddings status:", res.status);
    const data = await res.json();
    console.log("Embeddings dimension:", data.data?.[0]?.embedding?.length);
  } catch (err: any) {
    console.error("Embeddings error:", err.message);
  }

  console.log("Testing chat completion...");
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        messages: [{ role: "user", content: "Hello! Respond with 'OK'." }]
      })
    });
    console.log("Chat status:", res.status);
    const data = await res.json();
    console.log("Chat response:", data.choices?.[0]?.message?.content);
  } catch (err: any) {
    console.error("Chat error:", err.message);
  }
}
test();
