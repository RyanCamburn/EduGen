import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { transcribeVideo, summarizeTranscription } from "../data/video.js";

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
  const question = req.body.question;
  res.status(200).json({ message: "Question route" });
});

export default router;
