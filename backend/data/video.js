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

const summarizeTranscription = async (transcription) => {
  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2",
      prompt: `Summarize the following text: ${transcription}`,
      stream: false,
    });

    return response.data.response;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Summarization failed.";
  }
};

export { transcribeVideo, summarizeTranscription };
