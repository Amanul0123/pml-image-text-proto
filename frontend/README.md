# 🧠 PML Image & Text Prototype  

A **full-stack AI prototype** that integrates **text enhancement**, **text-to-image generation**, **image captioning**, and **image variation workflows** — built using **React (Vite)**, **Node.js (Express)**, **LiteLLM + OpenRouter**, **Pollinations**, and **Hugging Face** APIs.  

---

## 📦 Installation  

### Prerequisites  
- Node.js v16 or later  
- npm (Node Package Manager)  
- OpenRouter API key → [https://openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)  

---

## ⚙️ Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/Amanul0123/pml-image-text-proto.git
cd pml-image-text-proto
2️⃣ Backend Setup
bash
Copy code
cd backend
npm install
Create a .env file inside the backend folder:

ini
Copy code
OPENROUTER_API_KEY=sk-or-v1-your-key-here
PORT=5000
Run the backend server:

bash
Copy code
node index.mjs
✅ Backend will run on http://localhost:5000

3️⃣ Frontend Setup
In another terminal:

bash
Copy code
cd frontend
npm install
echo "VITE_API_ROOT=http://localhost:5000" > .env
npm run dev
✅ Frontend will run on http://localhost:5173

🔌 API Usage
✨ 1. Enhance Text
Endpoint: /api/enhance-text
Method: POST
Request Body:

json
Copy code
{
  "prompt": "a cat wearing sunglasses on a skateboard"
}
Response:

json
Copy code
{
  "enhanced": "A photorealistic image of a stylish cat wearing sunglasses and riding a skateboard in a city street."
}
🧠 2. Analyze Text
Endpoint: /api/analyze-text
Method: POST
Request Body:

json
Copy code
{
  "text": "I want a creative picture of an astronaut on Mars."
}
Response:

json
Copy code
{
  "analysis": {
    "sentiment": "Positive",
    "intent": "Request for creative generation",
    "tone": "Curious and imaginative"
  }
}
🖼️ 3. Generate Image
Endpoint: /api/generate-image
Method: POST
Request Body:

json
Copy code
{
  "prompt": "a golden retriever wearing sunglasses, cinematic lighting"
}
Response:

json
Copy code
{
  "image": "https://image.pollinations.ai/prompt/a%20golden%20retriever%20wearing%20sunglasses%20cinematic%20lighting"
}
🖋️ 4. Analyze Image
Endpoint: /api/analyze-image
Method: POST
Form Data:

image: (File upload)

Response:

json
Copy code
{
  "caption": "A golden retriever wearing sunglasses sitting outdoors."
}
🎨 5. Generate Variations
Endpoint: /api/generate-variations
Method: POST
Form Data:

image: (File upload)

Response:

json
Copy code
{
  "caption": "A man riding a skateboard.",
  "variations": [
    "https://image.pollinations.ai/prompt/A%20man%20riding%20a%20skateboard%20in%20realistic%20photo%20style",
    "https://image.pollinations.ai/prompt/A%20man%20riding%20a%20skateboard%20in%20digital%20art%20style",
    "https://image.pollinations.ai/prompt/A%20man%20riding%20a%20skateboard%20in%20cinematic%20lighting%20style"
  ]
}
🔄 Project Flow
text
Copy code
 ┌──────────────────────────┐
 │        Frontend          │
 │  React (Vite) + Tailwind │
 └────────────┬─────────────┘
              │
              ▼
 ┌──────────────────────────┐
 │        Backend           │
 │ Node.js + Express + LiteLLM │
 └────────────┬─────────────┘
              │
              ▼
 ┌──────────────────────────┐
 │     AI Integrations      │
 │ OpenRouter → Text (LLMs) │
 │ Pollinations → Images    │
 │ HuggingFace → Captioning │
 └──────────────────────────┘
Flow Summary:
1️⃣ User enters a text prompt → /api/enhance-text (LLM enhancement)
2️⃣ Enhanced text → /api/generate-image (Image generation)
3️⃣ Image uploaded → /api/analyze-image (Caption generation)
4️⃣ Caption reused → /api/generate-variations (3 styled images)
5️⃣ Frontend displays final outputs

🧩 Tech Stack
Layer	Technology
Frontend	React + Vite + TailwindCSS
Backend	Node.js + Express
Text Models	LiteLLM + OpenRouter
Image Generation	Pollinations API
Image Captioning	Hugging Face BLIP
Storage	Multer (in-memory upload)

🖼️ Screenshots
🏠 Home Page

🧠 Text to Image

🖋️ Image to Caption


🧰 Troubleshooting
Issue	Solution
no_prompt or no_text errors	Ensure you send valid JSON body
Hugging Face delays	Wait 30–60s (model cold start)
Pollinations blank result	Try a more descriptive prompt
401 Unauthorized	Check your OpenRouter API key in .env

📜 License
This project is licensed under the MIT License.
You are free to use, modify, and extend it for educational or professional use.

👨‍💻 Author
Amanul Haque
B.Tech (CS) | Full-Stack Developer | AI & Cloud Enthusiast

🌐 GitHub: https://github.com/Amanul0123

💼 LinkedIn: linkedin.com/in/amanul0123

✉️ Email: amanulhaque376@gmail.com