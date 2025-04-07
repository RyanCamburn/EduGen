import React, { useState } from "react";
import './App.css';
import { Upload, FileText, Sparkles, HelpCircle } from 'lucide-react';
import { Button, FileInput, Text, Loader, Container, Title, Radio } from "@mantine/core";
import OpenAI from "openai";
import axios from "axios";
const openai = new OpenAI({ apiKey: "YOUR_API_KEY_HERE", dangerouslyAllowBrowser: true });


function App() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  const handleFileChange = (file) => {
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a video file first.");

    setLoading(true);

    try {
      const transcribedText = await transcribeWithOpenAI(file);
      setTranscription(transcribedText);
    } catch (error) {
      console.error("Transcription failed:", error);
      alert("Error transcribing the file.");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcription) return alert("Please transcribe the video first.");

    setLoading(true);

    try {
      const summaryText = await summarizeWithLlama(transcription);
      setSummary(summaryText);
    } catch (error) {
      console.error("Summarization failed:", error);
      alert("Error summarizing the text.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async () => {
    if (!transcription) return alert("Please transcribe the video first.");

    setLoading(true);

    try {
      const questionText = await questionWithLlama(transcription);
      setQuestion(questionText);
    } catch (error) {
      console.error("Summarization failed:", error);
      alert("Error summarizing the text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ textAlign: "center", padding: "50px", background: "#282828", color: "white", minHeight: "100vh" }}>
      <Title order={1} style={{ marginBottom: "20px" }}>EduGen</Title>

      <FileInput placeholder="Insert Video (MP4, MKV)" onChange={handleFileChange} style={{ marginBottom: "20px" }} />

      <Button onClick={handleUpload} disabled={loading} className="icon-button">
      <Upload className="button-icon" />
        {loading ? <Loader size="sm" /> : "Upload & Transcribe"}
      </Button>

      {transcription && (
        <Container>
          <Text style={{ marginTop: "20px", color: "white", fontWeight: "bold" }}>Video Transcription:</Text>
          <Text>{transcription}</Text>
        </Container>
      )}

      <Button onClick={handleSummarize} disabled={loading || !transcription} style={{ marginTop: "20px" }} className="icon-button">
      <Sparkles className="button-icon" />
        {loading ? <Loader size="sm" /> : "Generate Summary"}
      </Button>

      {summary && (
        <Container>
          <Text style={{ marginTop: "20px", color: "white", fontWeight: "bold" }}>Video Summary:</Text>
          <Text>{summary}</Text>
        </Container>
      )}
      <Button onClick={handleQuestion} disabled={loading || !transcription} style={{ marginTop: "20px" }} className="icon-button">
      <HelpCircle className="button-icon" />
        {loading ? <Loader size="sm" /> : "Generate Questions"}
      </Button>

      {summary && (
        <Container>
          <Text style={{ marginTop: "20px", color: "white", fontWeight: "bold" }}>Questionaire:</Text>
          <Text>{question}</Text>
        </Container>
      )}
    </Container>
  );
}

export default App;

async function transcribeWithOpenAI(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("response_format", "text");

  try {
    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        Authorization: `Bearer "YOUR_API_KEY_HERE"`,
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(`[Transcription] Full OpenAI Response:`, response);
    console.log(`[Transcription] Success! OpenAI returned:`, response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.warn("Rate limit reached. Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
      return transcribeWithOpenAI(file); // Retry
    } else {
      console.error("Error calling OpenAI Whisper API:", error);
      return "Transcription failed.";
    }
  }
}

// 🟢 Ollama Llama 3.2 API for Summarization
async function summarizeWithLlama(text) {
  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2",
      prompt: `Summarize the following text:\n\n${text}`,
      stream: false,
    });

    return response.data.response; // Extracts the summarized text
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Summarization failed.";
  }
}

async function questionWithLlama(text) {
  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.2",
      prompt: `Create one multiple choice question in json format, only respond with the question, the options, and the correct option for the question, no following explanation:\n\n${text}`,
      stream: false,
    });

    return response.data.response;
  } catch (error) {
    console.error("Error creating questions:", error);
    return "Creating questions failed.";
  }
}

// 🟢 Multiple Choice Component
function MultipleChoiceQuestion({ questionData }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  let parsedQuestion;
  try {
    parsedQuestion = JSON.parse(questionData);
  } catch (error) {
    console.error("Error parsing question JSON:", error);
    return <Text>Error parsing the question data.</Text>;
  }

  const handleOptionChange = (value) => {
    setSelectedOption(parseInt(value, 10));
  };

  const handleSubmit = () => {
    if (selectedOption === parsedQuestion.correctOption) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  return (
    <Container style={{ marginTop: "20px", textAlign: "left" }}>
      <Text style={{ fontWeight: "bold" }}>{parsedQuestion.question}</Text>
      {parsedQuestion.options.map((option, index) => (
        <Radio
          key={index}
          label={option}
          value={String(index + 1)}
          checked={selectedOption === index + 1}
          onChange={() => handleOptionChange(index + 1)}
        />
      ))}
      <Button onClick={handleSubmit} disabled={selectedOption === null} style={{ marginTop: "10px" }} className="icon-button">
        Submit Answer
      </Button>

      {isCorrect !== null && (
        <Text style={{ marginTop: "10px", color: isCorrect ? "lightgreen" : "red", fontWeight: "bold" }}>
          {isCorrect ? "Correct!" : "Wrong! Try again."}
        </Text>
      )}
    </Container>
  );
}
