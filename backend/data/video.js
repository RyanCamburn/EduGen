import axios from "axios";
import { transcribeVideoPath } from "./helpers.js";

const transcribeVideo = async (videoPath) => {
  try {
    const transcription = await transcribeVideoPath(videoPath);
    console.log("🧠 Transcription length:", transcription.length);
    return transcription;
  } catch (err) {
    console.error("Transcription failed:", err.message);
    return "";
  }
};

function splitIntoChunks(text, chunkSize = 3000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

const summarizeTranscription = async (transcription) => {
  const chunks = splitIntoChunks(transcription);
  const summaries = [];

  for (let i = 0; i < chunks.length; i++) {
    try {
      const response = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3.2",
        prompt: `Summarize the following part of a transcript:\n\n${chunks[i]}`,
        stream: false,
      });

      summaries.push(response.data.response.trim());
    } catch (error) {
      console.error(`Error summarizing chunk ${i + 1}:`, error.message);
      summaries.push(`[Summary failed for chunk ${i + 1}]`);
    }
  }
  return summaries.join("\n");
};

export { transcribeVideo, summarizeTranscription };
