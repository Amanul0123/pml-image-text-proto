// backend/index.mjs
import express from "express";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import dotenv from "dotenv";
import { completion } from "litellm";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
const upload = multer({ storage: multer.memoryStorage() });

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

/* -------------------------------
   1️⃣ ENHANCE TEXT (OpenRouter + LiteLLM)
--------------------------------*/
app.post("/api/enhance-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "no_prompt" });

    const out = await completion({
      model: "openrouter/meta-llama/llama-3-8b-instruct:free", // free model
      api_base: "https://openrouter.ai/api/v1",
      api_key: OPENROUTER_KEY,
      messages: [
        { role: "system", content: "Enhance user prompts for image generation. Return only the improved version." },
        { role: "user", content: `Enhance this image prompt: ${prompt}` },
      ],
      max_tokens: 200,
    });

    const enhanced = out?.choices?.[0]?.message?.content?.trim() || prompt;
    res.json({ enhanced });
  } catch (err) {
    console.error("Enhance error:", err.message);
    res.status(500).json({ error: "enhance_failed", details: err.message });
  }
});

/* -------------------------------
   2️⃣ ANALYZE TEXT (OpenRouter + LiteLLM)
--------------------------------*/
app.post("/api/analyze-text", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "no_text" });

    const out = await completion({
      model: "openrouter/anthropic/claude-3-haiku:beta", // fast + accurate
      api_base: "https://openrouter.ai/api/v1",
      api_key: OPENROUTER_KEY,
      messages: [
        { role: "system", content: "Analyze the text and return a JSON with sentiment, tone, and intent." },
        { role: "user", content: text },
      ],
      max_tokens: 200,
    });

    const result = out?.choices?.[0]?.message?.content ?? "{}";
    res.json({ analysis: result });
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: "analyze_failed", details: err.message });
  }
});

/* -------------------------------
   3️⃣ GENERATE IMAGE (Pollinations API - Free)
--------------------------------*/
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "no_prompt" });

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    res.json({ image: imageUrl });
  } catch (err) {
    console.error("Image generation error:", err.message);
    res.status(500).json({ error: "image_generation_failed" });
  }
});

/* -------------------------------
   4️⃣ ANALYZE IMAGE (Hugging Face BLIP)
--------------------------------*/
app.post("/api/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file" });
    const b64 = req.file.buffer.toString("base64");

    const hf = await axios.post(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      { inputs: `data:image/png;base64,${b64}` },
      { timeout: 180000 }
    );

    let caption = "";
    if (Array.isArray(hf.data) && hf.data[0].generated_text)
      caption = hf.data[0].generated_text;
    else if (hf.data.generated_text)
      caption = hf.data.generated_text;
    else caption = JSON.stringify(hf.data);

    res.json({ caption });
  } catch (err) {
    console.error("Image analysis error:", err.message);
    res.status(500).json({ error: "image_analysis_failed", details: err.message });
  }
});

/* -------------------------------
   5️⃣ IMAGE VARIATIONS (Pollinations + BLIP)
--------------------------------*/
app.post("/api/generate-variations", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file" });
    const b64 = req.file.buffer.toString("base64");

    const hf = await axios.post(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      { inputs: `data:image/png;base64,${b64}` },
      { timeout: 180000 }
    );

    let caption = "";
    if (Array.isArray(hf.data) && hf.data[0].generated_text)
      caption = hf.data[0].generated_text;
    else caption = "an image";

    const styles = ["realistic photo", "digital art", "cinematic lighting"];
    const variations = styles.map(
      s => `https://image.pollinations.ai/prompt/${encodeURIComponent(`${caption} in ${s} style`)}`
    );

    res.json({ caption, variations });
  } catch (err) {
    console.error("Variation error:", err.message);
    res.status(500).json({ error: "variation_failed", details: err.message });
  }
});

app.get("/", (_, res) => res.send("✅ OpenRouter + Pollinations backend running."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
