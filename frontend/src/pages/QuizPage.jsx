import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  AppBar,
  Toolbar,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import logo from '../assets/logo.svg';

export default function QuizPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { videoId, transcription } = state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      const userAnswer = answers[i]?.trim();
      let correctAnswerText = null;

      if (q.type === 'multiple-choice') {
        if (typeof q.correctOption === 'number') {
          correctAnswerText = q.options[q.correctOption]?.trim();
        } else if (typeof q.correctOption === 'string') {
          correctAnswerText = q.correctOption.trim();
        }
      }

      if (
        q.type === 'fill-blank' &&
        userAnswer?.toLowerCase() === q.correctAnswer?.trim().toLowerCase()
      ) {
        correct++;
      } else if (
        q.type === 'multiple-choice' &&
        userAnswer?.toLowerCase() === correctAnswerText?.toLowerCase()
      ) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  const handleGenerate = async () => {
    if (!transcription) return;
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setScore(0);
    try {
      const response = await axios.post('http://localhost:3000/video/question', {
        transcript: transcription,
        videoId: videoId,
      });
      if (response.data?.questions) {
        setQuestions(response.data.questions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ backgroundColor: '#1a1a2e', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#3d3d50' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button size="small" variant="contained" onClick={() => navigate('/home')}>
              <img src={logo} alt="Logo" style={{ width: 50, height: 50 }} />
            </Button>
            <Typography variant="h6" color="white">
              EduGen
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/results')}>
              Back to Results
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h4" align="center" color="white" gutterBottom>
          AI-Generated Quiz
        </Typography>

        {questions.length === 0 && !loading ? (
          <Stack alignItems="center" spacing={2} mt={4}>
            <Typography align="center" color="gray">
              No questions loaded. Click below to generate a quiz from your transcription.
            </Typography>
            <Button variant="contained" onClick={handleGenerate}>
              Generate Quiz
            </Button>
          </Stack>
        ) : loading ? (
          <Stack alignItems="center" spacing={2} mt={4}>
            <CircularProgress color="inherit" />
            <Typography color="white">Generating quiz questions...</Typography>
          </Stack>
        ) : (
          <Stack spacing={4} mt={4}>
            {questions.map((q, index) => {
              let correctAnswerText = null;
              if (q.type === 'multiple-choice') {
                if (typeof q.correctOption === 'number') {
                  correctAnswerText = q.options[q.correctOption]?.trim();
                } else if (typeof q.correctOption === 'string') {
                  correctAnswerText = q.correctOption.trim();
                }
              }

              const isCorrect =
                q.type === 'fill-blank'
                  ? answers[index]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
                  : answers[index]?.trim().toLowerCase() === correctAnswerText?.toLowerCase();

              return (
                <Paper
                  key={index}
                  elevation={3}
                  sx={{ p: 3, backgroundColor: '#2c2c3e', color: 'white', borderRadius: 2 }}
                >
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1} (
                    {q.type === 'fill-blank' ? 'Fill-in-the-blank' : 'Multiple Choice'})
                  </Typography>
                  <Typography sx={{ mb: 2 }}>{q.question}</Typography>

                  {q.type === 'fill-blank' ? (
                    <TextField
                      variant="outlined"
                      fullWidth
                      value={answers[index] || ''}
                      onChange={(e) => handleChange(index, e.target.value)}
                      disabled={submitted}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: 1,
                        '& input': { color: 'black' },
                      }}
                    />
                  ) : (
                    <RadioGroup
                      value={answers[index] || ''}
                      onChange={(e) => handleChange(index, e.target.value)}
                    >
                      {q.options.map((opt, idx) => (
                        <FormControlLabel
                          key={idx}
                          value={opt.trim()}
                          control={<Radio disabled={submitted} />}
                          label={opt}
                          sx={{ color: 'white' }}
                        />
                      ))}
                    </RadioGroup>
                  )}

                  {submitted && (
                    <Typography color={isCorrect ? 'lightgreen' : 'error'}>
                      {answers[index] === undefined || answers[index] === ''
                        ? 'No answer submitted.'
                        : q.type === 'fill-blank'
                        ? `Correct answer: ${q.correctAnswer}`
                        : `Correct option: ${correctAnswerText}`}
                    </Typography>
                  )}
                </Paper>
              );
            })}
            <Stack direction="row" spacing={2} justifyContent="center">
              {!submitted && (
                <Button variant="contained" size="large" onClick={handleSubmit}>
                  Submit Answers
                </Button>
              )}
              <Button variant="outlined" size="large" onClick={handleGenerate}>
                Generate New Questions
              </Button>
            </Stack>
            {/* {submitted && (
              <Typography variant="h5" align="center" color="lightgreen" mt={5}>
                Your Score: {score} / {questions.length}
              </Typography>
            )} */}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
