const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ask-ai", async (req, res) => {
  const userPrompt = req.body.prompt;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!userPrompt || !apiKey) {
    return res.status(400).json({ error: "Missing prompt or API key." });
  }

  try {
    const openRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: `
Respond in plain text. If the response contains lines that look like section titles, wrap those lines in <strong>...</strong>.
If the response has multiple paragraphs or sections, separate them using <br><br>.
Do not use <p> tags, list bullets, or Markdown. The final output should be clean HTML suitable to set directly into a <p> element using .innerHTML.
Maximum 5000 characters total.`
          },
          { role: "user", content: userPrompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost", // or your domain
          "X-Title": "AI Space"
        }
      }
    );

    const content = openRes.data?.choices?.[0]?.message?.content || "";
    res.json({ content });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "AI request failed." });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});