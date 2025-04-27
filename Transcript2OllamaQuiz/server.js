const express = require('express');
const axios = require('axios');
const { encode } = require('gpt-3-encoder');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

function chunkText(text, maxTokens = 3500) {
    const chunks = [];
    const words = text.split(/\s+/);
    let currentChunk = [];
    let currentTokenCount = 0;

    for (const word of words) {
        const wordTokens = encode(word).length;
        if (currentTokenCount + wordTokens > maxTokens) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
            currentTokenCount = 0;
        }
        currentChunk.push(word);
        currentTokenCount += wordTokens;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
}

app.post('/api/generate-quiz', async (req, res) => {
    try {
        if (!req.body?.transcript) {
            return res.status(400).json({ error: "Transcript is required" });
        }

        const chunks = chunkText(req.body.transcript);
        let allQuestions = [];

        for (const [index, chunk] of chunks.entries()) {
            try {
                const prompt = `Extract concepts as JSON from this lecture segment:
${chunk}

Respond ONLY with valid JSON in this exact format:
{
  "concepts": [
    {
      "type": "fill-blank",
      "question": "The capital of France is ______.",
      "correctAnswer": "Paris"
    },
    {
      "type": "multiple-choice",
      "question": "What is the largest planet?",
      "options": ["Earth", "Jupiter", "Mars", "Venus"],
      "correctOption": "Jupiter"
    }
  ]
}`;

                const response = await axios.post('http://localhost:11434/api/generate', {
                    model: "llama3.2",
                    prompt: prompt,
                    stream: false,
                    options: { temperature: 0.3 }
                }, {
                    timeout: 60000
                });

                const parsed = tryParseJson(response.data.response);
                if (!parsed?.concepts) {
                    throw new Error("Invalid response format from LLM");
                }
                allQuestions.push(...parsed.concepts);
            } catch (error) {
                console.error(`Error processing chunk ${index + 1}:`, error.message);
                continue;
            }
        }

        const combinePrompt = `Combine these into a final quiz with exactly 6 fill-in-the-blank and 4 multiple-choice questions:
${JSON.stringify(allQuestions)}

Respond ONLY with valid JSON in this format:
{
  "questions": [
    {
      "type": "fill-blank",
      "question": "The ______ is the powerhouse of the cell.",
      "correctAnswer": "mitochondria"
    },
    {
      "type": "multiple-choice",
      "question": "What is the chemical symbol for gold?",
      "options": ["Au", "Ag", "Fe", "Hg"],
      "correctOption": "Au"
    }
  ]
}`;

        const finalResponse = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3.2",
            prompt: combinePrompt,
            stream: false,
            options: { temperature: 0.2 }
        }, {
            timeout: 60000
        });

        const finalQuiz = tryParseJson(finalResponse.data.response);
        if (!finalQuiz?.questions) {
            throw new Error("Invalid final quiz format");
        }

        res.json(finalQuiz);

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            error: "Quiz generation failed",
            details: error.message
        });
    }
});

function tryParseJson(jsonString) {
    try {
        const cleanString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanString);
    } catch (error) {
        throw new Error(`Invalid JSON: ${error.message}`);
    }
}

app.listen(PORT, () => {
    console.log(`Server running @ http://localhost:${PORT}`);
});