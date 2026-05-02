# AI Text Studio 🚀

A modern, premium web application for generating concise summaries, analyzing text for AI generation, and automatically humanizing content. Built with Node.js and the Hugging Face Inference API.

## ✨ Features

- **Premium Two-Column Workspace**: Sleek dark mode UI with glassmorphism effects, dividing the workspace into a Content Editor and an Insights Panel.
- **Advanced Summarization**: Powered by `facebook/bart-large-cnn` to instantly distill long articles into concise insights.
- **Custom Summary Length**: Users can define the exact length (max words) for their generated summaries.
- **Multi-Format Document Upload**: Easily upload and extract text from `.pdf`, `.docx`, `.txt`, and Image files (using Tesseract OCR, mammoth, and pdf-parse).
- **AI Detection Analysis**: Analyzes text using `roberta-base-openai-detector` to display a live "Human vs. AI" score using dynamic progress bars.
- **Auto-Humanize Text**: Refines and rewrites text using `Meta-Llama-3-8B-Instruct` to sound completely natural, conversational, and human-like.
- **One-Click Copy**: Easily copy generated results to your clipboard.

## 🛠 Technology Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+).
- **Backend**: Node.js & Express.js.
- **AI Integration**: Hugging Face official Inference SDK.
- **File Parsing**: Multer, `pdf-parse`, `mammoth` (Word docs), `tesseract.js` (OCR for images).
- **Tools**: CORS, Dotenv.

## 🔄 Workflow Architecture

1. **Content Input**: User pastes text or uploads a document into the Content Editor.
2. **Settings**: User selects the desired summary length.
3. **AI Summarization**: The backend calls the Hugging Face `bart-large-cnn` model to generate a summary.
4. **AI Analysis**: Clicking "Analyze AI" hits a classification model to determine the probability of the text being human vs AI.
5. **Auto-Humanize**: The `Meta-Llama-3` model lightly paraphrases the text to increase its natural conversational flow and improve the human score.
6. **Live Insights**: The right panel dynamically updates with summaries, scores, and smooth fade-in animations without any clunky modals.

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
*Created for efficient text processing, AI analysis, and modern web demonstration.*
