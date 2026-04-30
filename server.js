require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { HfInference } = require('@huggingface/inference');

const app = express();
const PORT = process.env.PORT || 5000;

const hf = new HfInference(process.env.HF_API_TOKEN);
console.log('HF Token loaded:', process.env.HF_API_TOKEN ? 'Yes (starts with ' + process.env.HF_API_TOKEN.substring(0, 5) + ')' : 'No');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/generate-summary', async (req, res) => {
    const { text } = req.body;

    if (!text || text.length < 50) {
        return res.status(400).json({ error: 'Text must be at least 50 characters long.' });
    }

    try {
        const result = await hf.summarization({
            model: 'facebook/bart-large-cnn',
            inputs: text,
            parameters: {
                max_length: 150,
                min_length: 40
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
