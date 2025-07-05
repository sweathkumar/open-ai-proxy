require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ask-ai', async (req, res) => {
  const prompt = req.body.prompt;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!prompt || !apiKey) {
    return res.status(400).json({ error: 'Missing prompt or API key.' });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content: `Respond in HTML using <strong> for titles and <br><br> between paragraphs.`
          },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "AI Space"
        }
      }
    );

    res.json({ response: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
