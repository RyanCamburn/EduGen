const express = require('express');
const axios = require('axios');
const { encode } = require('gpt-3-encoder');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
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

// Helper function to remove duplicate questions
function removeDuplicateQuestions(questions) {
    const seen = new Set();
    return questions.filter(q => {
        const key = q.question.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// Helper function to filter out generic questions
function filterGenericQuestions(questions) {
    const genericPatterns = [
        /capital of/i,
        /largest planet/i,
        /chemical symbol/i,
        /alan turing/i,
        /color of the sky/i,
        /powerhouse of the cell/i
    ];
    
    return questions.filter(q => {
        return !genericPatterns.some(pattern => pattern.test(q.question));
    });
}

// Helper function to prepare final questions with flexible counts
function prepareFinalQuestions(allQuestions) {
    // Separate question types
    let fillBlank = allQuestions.filter(q => q.type === 'fill-blank');
    let multipleChoice = allQuestions.filter(q => q.type === 'multiple-choice');
    
    // Remove duplicates
    fillBlank = removeDuplicateQuestions(fillBlank);
    multipleChoice = removeDuplicateQuestions(multipleChoice);
    
    // Filter out generic questions
    fillBlank = filterGenericQuestions(fillBlank);
    multipleChoice = filterGenericQuestions(multipleChoice);
    
    // Sort by length (longer questions tend to be more specific)
    fillBlank.sort((a,b) => b.question.length - a.question.length);
    multipleChoice.sort((a,b) => b.question.length - a.question.length);
    
    // Calculate proportional distribution
    const totalQuestions = Math.min(Math.max(allQuestions.length, 7), 12);
    const fillBlankRatio = 0.6; // 60% fill-in-the-blank
    const fillBlankCount = Math.max(3, Math.floor(totalQuestions * fillBlankRatio));
    const multipleChoiceCount = Math.max(2, totalQuestions - fillBlankCount);
    
    return {
        fillBlank: fillBlank.slice(0, fillBlankCount),
        multipleChoice: multipleChoice.slice(0, multipleChoiceCount)
    };
}

// Main quiz generation endpoint
app.post('/api/generate-quiz', async (req, res) => {
    try {
        if (!req.body?.transcript) {
            return res.status(400).json({ error: "Transcript is required" });
        }

        const chunks = chunkText(req.body.transcript);
        let allQuestions = [];
        let chunkErrors = [];

        for (const [index, chunk] of chunks.entries()) {
            try {
                const prompt = `Extract quiz questions from this lecture segment:
${chunk}

Requirements:
1. Create BOTH fill-in-the-blank AND multiple-choice questions
2. Fill-in-the-blank MUST:
   - Contain "______" placeholder
   - Test lecture-specific knowledge
3. Multiple-choice MUST:
   - Have 4 plausible options
   - Include one clearly correct answer
4. Avoid generic knowledge questions

Respond with ONLY valid JSON in this format:
{
  "concepts": [
    {
      "type": "fill-blank",
      "question": "The ______ algorithm is used for this purpose.",
      "correctAnswer": "specific-technique"
    },
    {
      "type": "multiple-choice",
      "question": "What is the main advantage of this approach?",
      "options": [
        "Option 1",
        "Option 2", 
        "Option 3",
        "Option 4"
      ],
      "correctOption": "Option 3"
    }
  ]
}`;

                const response = await axios.post('http://localhost:11434/api/generate', {
                    model: "llama3.2",
                    prompt: prompt,
                    stream: false,
                    options: { 
                        temperature: 0.3,
                        response_format: { type: "json_object" }
                    }
                }, {
                    timeout: 60000
                });

                // Extract and validate JSON
                let jsonString = response.data.response.trim();
                const jsonStart = jsonString.indexOf('{');
                const jsonEnd = jsonString.lastIndexOf('}') + 1;
                
                if (jsonStart === -1 || jsonEnd === 0) {
                    throw new Error("No JSON found in response");
                }
                
                jsonString = jsonString.slice(jsonStart, jsonEnd);
                const parsed = JSON.parse(jsonString);

                if (!parsed?.concepts || !Array.isArray(parsed.concepts)) {
                    throw new Error("Invalid concepts array in response");
                }

                // Validate questions
                const validQuestions = parsed.concepts.filter(q => {
                    if (q.type === 'fill-blank') {
                        return q.question?.includes('______') && q.correctAnswer;
                    } else if (q.type === 'multiple-choice') {
                        return q.options?.length === 4 && q.correctOption;
                    }
                    return false;
                });

                if (validQuestions.length > 0) {
                    allQuestions.push(...validQuestions);
                } else {
                    throw new Error("No valid questions in chunk");
                }
                
            } catch (error) {
                chunkErrors.push({
                    chunk: index + 1,
                    error: error.message
                });
                continue;
            }
        }

        // Prepare final questions with flexible counts
        const { fillBlank, multipleChoice } = prepareFinalQuestions(allQuestions);
        const finalQuestions = [...fillBlank, ...multipleChoice];

        // Minimum requirement: at least 2 of each type
        if (fillBlank.length < 2 || multipleChoice.length < 2) {
            throw new Error(`Insufficient questions: ${fillBlank.length} fill-blank and ${multipleChoice.length} multiple-choice`);
        }

        res.json({
            questions: finalQuestions,
            stats: {
                chunksProcessed: chunks.length,
                chunksWithErrors: chunkErrors.length,
                totalQuestions: finalQuestions.length,
                fillBlankCount: fillBlank.length,
                multipleChoiceCount: multipleChoice.length
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            error: "Quiz generation failed",
            details: error.message,
            suggestion: "Try with a more detailed transcript or different phrasing"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running @ http://localhost:${PORT}`);
});