// api/ask-ai.js
const axios = require("axios");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const userPrompt = req.body.prompt;

  if (!userPrompt || !apiKey) {
    return res.status(400).json({ error: "Missing prompt or API key." });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: `Respond in plain text. If the response contains lines that look like section titles, wrap those lines in <strong>...</strong>. Use <br><br> between paragraphs.`
          },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://yourdomain.com",
          "X-Title": "AI Space"
        }
      }
    );

    const content = response.data.choices?.[0]?.message?.content || "No content";
    return res.status(200).json({ response: content });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch AI response" });
  }
}
