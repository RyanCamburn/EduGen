import axios from 'axios';
import { transcribeVideoPath } from './helpers.js';

const transcribeVideo = async (videoPath) => {

  const audioPath = await transcribeVideoPath(videoPath);

  const form = new FormData();
  form.append("file", fs.createReadStream(audioPath));
  form.append("model", "whisper-1");
  form.append("response_format", "text");

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error(
      `OpenAI error for ${audioPath}:`,
      err.response?.data || err.message
    );
    return "";
  }

}

const summarizeTranscription = async (transcription) => {

    try {
        const response = await axios.post("http://localhost:11434/api/generate", {
          model: "gemma3:4b",
          prompt: `Summarize the following text:\n\n${transcription}`,
          stream: false,
        });
    
        return response.data.response;
      } catch (error) {
        console.error("Error summarizing text:", error);
        return "Summarization failed.";
      }

}  

export { transcribeVideo, summarizeTranscription };

