import { Router } from "express";
import multer from "multer";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { transcribeVideo, summarizeTranscription } from "../data/video.js";
import { tryParseJson, chunkText } from "../data/helpers.js";

// __dirname polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const router = Router();

router.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video uploaded" });
    }

    const transcription = await transcribeVideo(req.file.path);
    const summary = await summarizeTranscription(transcription);
    console.log(
      "⬅️ Final transcription sent to client:",
      transcription.slice(0, 200)
    ); // preview
    res.status(200).json({ transcription, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.route("/question").post(async (req, res) => {
  try {
    if (!req.body?.transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    const chunks = chunkText(req.body.transcript);
    let allQuestions = [];

    for (const [index, chunk] of chunks.entries()) {
      try {
        const prompt = `Extract concepts from this lecture segment:
${chunk}

Respond ONLY with valid JSON in this exact format:
{
"concepts": [
{
  "concept": "Concept Content (String, multiple sentences)",
},
{
  "concept": "Concept Content (String, multiple sentences)",
}
]
}`;

        const response = await axios.post(
          "http://localhost:11434/api/generate",
          {
            model: "llama3.2",
            prompt: prompt,
            stream: false,
            options: { temperature: 0.3 },
          },
          {
            timeout: 60000,
          }
        );

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

    const combinePrompt = `You must act as a JSON generator.

Your output must be ONLY valid JSON and nothing else. No introductions, no explanations, no notes.
Combine these into a final quiz with exactly 6 fill-in-the-blank and 4 multiple-choice questions:
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

    const finalResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2",
        prompt: combinePrompt,
        stream: false,
        options: { temperature: 0.2 },
      },
      {
        timeout: 60000,
      }
    );

    const finalQuiz = tryParseJson(finalResponse.data.response);
    if (!finalQuiz?.questions) {
      throw new Error("Invalid final quiz format");
    }

    res.status(200).json(finalQuiz);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Quiz generation failed",
      details: error.message,
    });
  }
});

export default router;
