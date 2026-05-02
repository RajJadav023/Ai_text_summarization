require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { HfInference } = require('@huggingface/inference');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 5000;

const hf = new HfInference(process.env.HF_API_TOKEN);
console.log('HF Token loaded:', process.env.HF_API_TOKEN ? 'Yes (starts with ' + process.env.HF_API_TOKEN.substring(0, 5) + ')' : 'No');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/generate-summary', async (req, res) => {
    const { text, length } = req.body;

    if (!text || text.length < 50) {
        return res.status(400).json({ error: 'Text must be at least 50 characters long.' });
    }

    try {
        const result = await hf.summarization({
            model: 'facebook/bart-large-cnn',
            inputs: text,
            parameters: {
                max_length: length ? Math.min(Math.max(length, 30), 1000) : 150,
                min_length: length ? Math.max(Math.floor(length * 0.3), 20) : 40
            }
        });

        if (result && result.summary_text) {
            res.json({ summary: result.summary_text });
        } else {
            res.status(500).json({ error: 'Failed to generate summary' });
        }
    } catch (error) {
        console.error('Error calling Hugging Face SDK:', error);
        res.status(500).json({ error: 'AI processing failed. See server logs.' });
    }
});

app.post('/upload-extract', upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        let extractedText = '';
        const fileType = req.file.mimetype;
        const buffer = req.file.buffer;

        if (fileType === 'application/pdf') {
            const data = await pdfParse(buffer);
            extractedText = data.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer: buffer });
            extractedText = result.value;
        } else if (fileType.startsWith('image/')) {
            const result = await Tesseract.recognize(buffer, 'eng');
            extractedText = result.data.text;
        } else if (fileType === 'text/plain') {
            extractedText = buffer.toString('utf8');
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF, DOCX, TXT, or Image file.' });
        }

        // Clean up text slightly
        extractedText = extractedText.replace(/\s+/g, ' ').trim();

        res.json({ text: extractedText });
    } catch (error) {
        console.error('File extraction error:', error);
        res.status(500).json({ error: 'Failed to extract text from the file.' });
    }
});

app.post('/check-humanization', async (req, res) => {
    const { text } = req.body;

    if (!text || text.length < 50) {
        return res.status(400).json({ error: 'Text must be at least 50 characters long to analyze.' });
    }

    try {
        const result = await hf.textClassification({
            model: 'roberta-base-openai-detector',
            inputs: text.substring(0, 1500), // Avoid exceeding token limits
        });

        let humanScore = 0;
        let aiScore = 0;
        
        if (Array.isArray(result)) {
            result.forEach(item => {
                if (item.label === 'Real') humanScore = Math.round(item.score * 100);
                if (item.label === 'Fake') aiScore = Math.round(item.score * 100);
            });
        }

        res.json({ humanScore, aiScore });
    } catch (error) {
        console.error('Error calling Hugging Face for humanization:', error);
        res.status(500).json({ error: 'Humanization analysis failed.' });
    }
});

app.post('/refine-text', async (req, res) => {
    const { text } = req.body;

    if (!text || text.length < 10) {
        return res.status(400).json({ error: 'Text is too short to refine.' });
    }

    try {
        const result = await hf.chatCompletion({
            model: 'meta-llama/Meta-Llama-3-8B-Instruct',
            messages: [
                { role: 'system', content: 'You are a writing assistant. Lightly paraphrase the user\'s text to make it sound slightly more natural and human-like. Do NOT completely rewrite it or make it overly casual. Preserve the original meaning, professional tone, and structure. Just improve the flow gently. Do NOT add any intro, outro, or explanations. Output ONLY the refined text without quotes.' },
                { role: 'user', content: text.substring(0, 3000) }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.95
        });

        const refinedText = result.choices[0].message.content.trim();
        res.json({ refinedText });
    } catch (error) {
        console.error('Error calling Hugging Face for refinement:', error);
        res.status(500).json({ error: 'Failed to refine text.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
