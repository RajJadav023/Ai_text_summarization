# AI Text Summarization Tool 🚀

A modern, premium web application for generating concise summaries of long articles, using the Hugging Face Inference API.

## ✨ Features
- **Premium UI**: Dark mode with neon accents and frosted-glass effects (Glassmorphism).
- **Bart AI**: Powered by `facebook/bart-large-cnn`, a state-of-the-art NLP model.
- **Copy to Clipboard**: One-click copying for generated results.
- **Responsive**: Fully optimized for mobile and desktop screens.

## 🛠 Technology Stack
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+).
- **Backend**: Node.js & Express.js.
- **AI Integration**: Hugging Face official Inference SDK.
- **Tools**: Axios, CORS, Dotenv.

## 🔄 Workflow Architecture
1. **User Input**: User pastes a long paragraph (50+ characters) into the textured input area.
2. **Frontend Request**: The browser sends a POST request with the text to the Node.js `/generate-summary` endpoint.
3. **Backend Processing**: The Express server receives the text and calls the Hugging Face Inference API using the official SDK.
4. **AI Summarization**: The `bart-large-cnn` model processes the text on Hugging Face's high-performance servers.
5. **Result Retrieval**: The generated summary is returned to the Node.js server and then sent back to the frontend.
6. **Display**: The UI dynamically updates to show the summary with a smooth fade-in animation.

## 🚀 How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- A Hugging Face Access Token (get it from [hf.co/settings/tokens](https://huggingface.co/settings/tokens)).

### 2. Setup
Clone the project and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Hugging Face token:
```env
HF_API_TOKEN=your_hugging_face_token_here
PORT=5000
```

### 4. Start the Application
```bash
node server.js
```
The application will be running at `http://localhost:5000`.

---
*Created for efficient text processing and modern web demonstration.*
