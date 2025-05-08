import { Router } from "express";
import multer from "multer";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { transcribeVideo, summarizeTranscription } from "../data/video.js";
import { prepareFinalQuestions, chunkText } from "../data/helpers.js";
import { ObjectId, UUID } from 'mongodb';
import { transcriptions } from '../config/mongoCollections.js';

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

    const videoData = {
      transcription,
      summary,
      questions: []
    }

    let videoId;

    try{
      const transcriptionCollection = await transcriptions();
      const insertInfo = await transcriptionCollection.insertOne(videoData);
      if (!insertInfo.acknowledged || !insertInfo.insertedId)
        throw 'Could not add video data to database!';
      videoId = insertInfo.insertedId.toString();
    } catch(e){
      res.status(500).json({error: "Something went wrong while adding the video to the database"});
    }
    

    console.log(
      "⬅️ Final transcription sent to client:",
      transcription.slice(0, 200)
    ); // preview
    res.status(200).json({ 
      videoId,
      transcription,
      summary 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.route("/question").post(async (req, res) => {
  try {
    const { transcript, videoId } = req.body;
    if (!transcript || !videoId) {
      return res
        .status(400)
        .json({ error: "Both transcript AND videoId are required" });
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

        const response = await axios.post(
          "http://localhost:11434/api/generate",
          {
            model: "llama3.2",
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.3,
              response_format: { type: "json_object" },
            },
          },
          {
            timeout: 60000,
          }
        );

        // Extract and validate JSON
        let jsonString = response.data.response.trim();
        const jsonStart = jsonString.indexOf("{");
        const jsonEnd = jsonString.lastIndexOf("}") + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("No JSON found in response");
        }

        jsonString = jsonString.slice(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonString);

        if (!parsed?.concepts || !Array.isArray(parsed.concepts)) {
          throw new Error("Invalid concepts array in response");
        }

        // Validate questions
        const validQuestions = parsed.concepts.filter((q) => {
          if (q.type === "fill-blank") {
            return q.question?.includes("______") && q.correctAnswer;
          } else if (q.type === "multiple-choice") {
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
          error: error.message,
        });
        continue;
      }
    }

    // Prepare final questions with flexible counts
    const { fillBlank, multipleChoice } = prepareFinalQuestions(allQuestions);
    const finalQuestions = [...fillBlank, ...multipleChoice];

    // Minimum requirement: at least 2 of each type
    if (fillBlank.length < 2 || multipleChoice.length < 2) {
      throw new Error(
        `Insufficient questions: ${fillBlank.length} fill-blank and ${multipleChoice.length} multiple-choice`
      );
    }

    const transcriptionCollection = await transcriptions();
    const result = await transcriptionCollection.updateOne(
      { _id: new ObjectId(videoId) },
      { $set: { questions: finalQuestions } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    res.status(200).json({
      questions: finalQuestions,
      stats: {
        chunksProcessed: chunks.length,
        chunksWithErrors: chunkErrors.length,
        totalQuestions: finalQuestions.length,
        fillBlankCount: fillBlank.length,
        multipleChoiceCount: multipleChoice.length,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Quiz generation failed",
      details: error.message,
      suggestion: "Try with a more detailed transcript or different phrasing",
    });
  }
});

export default router;
