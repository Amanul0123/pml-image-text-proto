// backend/index.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 1️⃣ Enhance Text (free Hugging Face model)
 * Uses google/flan-t5-base to rewrite the text prompt.
 */
app.post("/api/enhance-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      { inputs: `Enhance this text prompt for image generation:\n${prompt}` },
      { timeout: 120000 }
    );

    let enhanced = "";
    if (Array.isArray(response.data) && response.data[0].generated_text)
      enhanced = response.data[0].generated_text;
    else if (response.data.generated_text)
      enhanced = response.data.generated_text;
    else
      enhanced = JSON.stringify(response.data);

    res.json({ enhanced: enhanced.trim() });
  } catch (err) {
    console.error("Enhance error:", err.message);
    res.status(500).json({ error: "enhance_failed", details: err.message });
  }
});

/**
 * 2️⃣ Generate Image (Stable Diffusion 2, free endpoint)
 * No key required, returns a base64 image.
 */
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      { inputs: prompt },
      { responseType: "arraybuffer", timeout: 300000 }
    );
    const base64 = Buffer.from(result.data, "binary").toString("base64");
    res.json({ image: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error("Image generation error:", err.message);
    res.status(500).json({ error: "image_generation_failed", details: err.message });
  }
});

/**
 * 3️⃣ Analyze Uploaded Image (BLIP captioning, free endpoint)
 * Returns a short description of the uploaded image.
 */
app.post("/api/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file" });

    const b64 = req.file.buffer.toString("base64");
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      { inputs: `data:image/png;base64,${b64}` },
      { timeout: 180000 }
    );

    let caption = "";
    if (Array.isArray(response.data) && response.data[0].generated_text)
      caption = response.data[0].generated_text;
    else if (response.data.generated_text)
      caption = response.data.generated_text;
    else
      caption = JSON.stringify(response.data);

    // simple fallback if caption empty
    if (!caption || caption.trim() === "") caption = "Could not analyze image.";

    res.json({ caption });
  } catch (err) {
    console.error("Image analysis error:", err.message);
    res.status(500).json({ error: "image_analysis_failed", details: err.message });
  }
});

/**
 * 4️⃣ Generate Variations (Free Stable Diffusion + BLIP combo)
 * Captions the uploaded image and creates 3 style variants.
 */
app.post("/api/generate-variations", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file" });

    // Step 1: Caption the uploaded image
    const b64 = req.file.buffer.toString("base64");
    const capRes = await axios.post(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      { inputs: `data:image/png;base64,${b64}` },
      { timeout: 180000 }
    );

    let caption = "";
    if (Array.isArray(capRes.data) && capRes.data[0].generated_text)
      caption = capRes.data[0].generated_text;
    else caption = "an image";

    // Step 2: Generate 3 styled variations
    const styles = [
      "photorealistic style",
      "digital art style",
      "cinematic dramatic lighting style",
    ];

    const variations = [];
    for (const style of styles) {
      const prompt = `A ${style} version of ${caption}`;
      const imgRes = await axios.post(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
        { inputs: prompt },
        { responseType: "arraybuffer", timeout: 300000 }
      );
      const img64 = Buffer.from(imgRes.data, "binary").toString("base64");
      variations.push(`data:image/png;base64,${img64}`);
    }

    res.json({ caption, variations });
  } catch (err) {
    console.error("Variation error:", err.message);
    res.status(500).json({ error: "variation_failed", details: err.message });
  }
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Backend is running (Free Hugging Face version)");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
