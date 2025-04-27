const express = require('express');
const axios = require('axios');
const { encode } = require('gpt-3-encoder'); // For token counting

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Helper function to split text into chunks
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
    const { transcript } = req.body;
    
    // Split transcript into chunks
    const chunks = chunkText(transcript);
    let allQuestions = [];

    // Process each chunk sequentially
    for (const chunk of chunks) {
        const prompt = `Extract key concepts and potential quiz questions from this partial lecture transcript:
${chunk}

Format as:
- 2 short answer concepts
- 1 multiple choice concept (with 4 options)`;

        try {
            const response = await axios.post('http://localhost:11434/api/generate', {
                model: "llama3.2",
                prompt: prompt,
                stream: false,
                options: { temperature: 0.7 }
            });

            allQuestions.push(response.data.response);
        } catch (error) {
            console.error(`Error processing chunk: ${error.message}`);
        }
    }

    // Combine all partial results and generate final quiz
    const combinePrompt = `Combine these partial question sets into one cohesive quiz:
${allQuestions.join('\n\n')}

Final format should have:
- 6 short answer questions
- 4 multiple choice questions (with 4 options each)
- Organized by topic`;

    const finalResponse = await axios.post('http://localhost:11434/api/generate', {
        model: "llama3.2",
        prompt: combinePrompt,
        stream: false
    });

    res.json({ 
        quiz: finalResponse.data.response,
        processedChunks: chunks.length
    });
});

app.listen(PORT, () => {
    console.log(`Server running @ http://localhost:${PORT}`);
});