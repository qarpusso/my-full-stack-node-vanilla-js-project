import OpenAI from "openai";

export async function chatCompletions(req, res) {
  const messages = [
    {
      role: "system",
      content: `You are Duck.ai, a friendly and helpful AI assistant. 
      Your tone is clever, concise, and occasionally includes duck-related puns if appropriate, but you remain professional. 
      Your output must be in structured Markdown. Skip intros and outros, get straight to the point.`,
    },
    { role: "user", content: req.body.userPrompt },
  ];

  const openai = new OpenAI({
    apiKey: process.env.AI_KEY,
    baseURL: process.env.AI_URL,
  });

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: req.body.model || process.env.AI_MODEL,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const chunkContent = chunk.choices[0]?.delta?.content;
      if (chunkContent) {
        res.write(`data: ${JSON.stringify({ content: chunkContent })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
}
