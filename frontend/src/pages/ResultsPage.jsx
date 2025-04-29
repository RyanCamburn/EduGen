import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Stack,
  AppBar,
  Toolbar,
  Container,
} from '@mui/material';
import axios from 'axios';
import logo from '../assets/logo.svg';

export default function ResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { transcription, summary } = state || {};
  const [questionText, setQuestionText] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const generateQuestionFromText = async (text) => {
    try {
      const response = await axios.post('http://localhost:3000/video/question', {
        text,
      });
      return response.data;
    } catch (error) {
      console.error('Question generation failed:', error);
      return 'Error generating question.';
    }
  };

  const handleGenerateQuestion = async () => {
    if (!transcription) return;
    setLoading(true);
    const question = await generateQuestionFromText(transcription);
    setQuestionText(question);
    setLoading(false);
    navigate('/quiz', {
      state: {
        questions: Array.isArray(generatedQuestions) ? generatedQuestions : [generatedQuestions],
      },
    });
  };

  return (
    <Box sx={{ backgroundColor: '#1a1a2e', minHeight: '100vh' }}>
      {/* Navbar */}
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
            <Button variant="outlined" onClick={() => navigate('/home')}>
              Home
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ py: 5 }}>
        <Grid container spacing={4} alignItems="flex-start">
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: '#2c2c3a',
                color: 'white',
                height: '100%',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Previous Transcriptions
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" fullWidth color="inherit">
                  Lecture 1
                </Button>
                <Button variant="outlined" fullWidth color="inherit">
                  Lecture 2
                </Button>
                <Button variant="outlined" fullWidth color="inherit">
                  Meeting Notes
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Right content: Centered Transcription & Summary cards */}
          <Grid item xs={12} md={9}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 4,
                flexWrap: 'wrap',
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: '#2c2c3a',
                  minHeight: '400px',
                  flex: 1,
                  minWidth: '300px',
                  maxWidth: '45%',
                  color: 'white',
                  overflow: 'auto',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Video Transcription
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {transcription || 'No data received.'}
                </Typography>
              </Paper>

              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: '#2c2c3a',
                  minHeight: '400px',
                  flex: 1,
                  minWidth: '300px',
                  maxWidth: '45%',
                  color: 'white',
                  overflow: 'auto',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Video Summary
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {summary || 'No data received.'}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" mt={5}>
          <Button variant="contained" size="large" onClick={() => alert('Upload coming soon')}>
            Download Result
          </Button>
        </Stack>
        <Stack direction="column" spacing={2} alignItems="center" mt={4}>
          <Button variant="contained" onClick={handleGenerateQuestion} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Questions'}
          </Button>

          {questionText && (
            <Paper sx={{ p: 2, backgroundColor: '#f4f4f4', width: '100%', maxWidth: 800 }}>
              <Typography variant="h6" gutterBottom color="black">
                Generated Question
              </Typography>
              <Typography color="black" sx={{ whiteSpace: 'pre-wrap' }}>
                {questionText}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
