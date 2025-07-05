const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
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
            content:
              'Respond only in raw HTML. Wrap section titles in <strong>...</strong>. Separate paragraphs with <br><br>. Do NOT use Markdown (like **text**), and avoid \\n. Only return clean HTML usable in a <p> tag not include <p> in response  with .innerHTML.'
          },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://open-ai-proxy-one.vercel.app",
          "X-Title": "AI Space",
        },
      }
    );

    const rawContent = response.data.choices?.[0]?.message?.content || "No content";
    const cleanedContent = rawContent.replace(/\\n/g, "<br>").replace(/\n/g, "<br>");
    return res.status(200).json({ response: cleanedContent });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch AI response" });
  }
};
