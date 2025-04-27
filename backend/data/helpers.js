import fs from "fs-extra";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import FormData from "form-data";
import axios from "axios";
import os from "os";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: ".env" });

const MAX_MB = 24;
const CHUNK_DURATION_SECONDS = 300;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

async function splitVideo(filePath, outputDir) {
  await fs.ensureDir(outputDir);
  const duration = await getVideoDuration(filePath);
  const chunks = Math.ceil(duration / CHUNK_DURATION_SECONDS);
  const chunkPaths = [];

  for (let i = 0; i < chunks; i++) {
    const chunkPath = path.join(outputDir, `chunk_${i}.mp4`);
    await new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .setStartTime(i * CHUNK_DURATION_SECONDS)
        .setDuration(CHUNK_DURATION_SECONDS)
        .output(chunkPath)
        .on("end", () => {
          chunkPaths.push(chunkPath);
          resolve();
        })
        .on("error", reject)
        .run();
    });
  }

  return chunkPaths;
}

async function convertToMp3(inputPath) {
  const tempAudioDir = path.join(os.tmpdir(), "audio_chunks");
  await fs.ensureDir(tempAudioDir);

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const safeBaseName = baseName.replace(/[^\w\d_-]/g, "_");
  const outputPath = path.join(tempAudioDir, `${safeBaseName}.mp3`);

  console.log("Saving to:", outputPath);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec("libmp3lame") // Codec for MP3
      .outputFormat("mp3") // Ensure MP3 output format
      .audioBitrate("128k") // Standard bitrate
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", (err) => {
        console.error(`Failed to convert ${inputPath} to mp3:\n`, err.message);
        reject(err);
      })
      .run();
  });
}

async function transcribeFileToText(audioPath) {
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

async function transcribeVideoPath(filePath) {
  const outputDir = path.join(__dirname, "chunks");
  const audioDir = path.join(__dirname, "audio");
  const fileSizeMB = getFileSizeInMB(filePath);

  let videoChunks = [];

  if (fileSizeMB > MAX_MB) {
    console.log(`File is ${fileSizeMB.toFixed(2)}MB, splitting into chunks...`);
    videoChunks = await splitVideo(filePath, outputDir);
  } else {
    console.log(`File is ${fileSizeMB.toFixed(2)}MB, no need to split.`);
    videoChunks = [filePath];
  }

  let fullTranscript = "";

  for (const chunk of videoChunks) {
    console.log(`Converting ${chunk} to .mp3...`);
    const audioPath = await convertToMp3(chunk);

    console.log(`Transcribing ${audioPath}...`);
    const text = await transcribeFileToText(audioPath);
    fullTranscript += text + "\n";
  }
  console.log(fullTranscript);

  // Cleanup
  if (fileSizeMB > MAX_MB) await fs.remove(outputDir);
  await fs.remove(audioDir);

  return fullTranscript;
}

export { transcribeVideoPath };
