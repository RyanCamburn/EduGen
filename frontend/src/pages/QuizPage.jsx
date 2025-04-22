import React from 'react';
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
} from '@mui/material';
import logo from '../assets/logo.svg';

export default function QuizPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { questions = [] } = state || {};

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
            <Button variant="outlined" onClick={() => navigate('/results')}>
              Back to Results
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography variant="h4" align="center" color="white" gutterBottom>
          AI-Generated Quiz
        </Typography>

        {questions.length === 0 ? (
          <Typography align="center" color="gray" mt={4}>
            No questions found. Go back and generate questions from your summary.
          </Typography>
        ) : (
          <Stack spacing={3} mt={4}>
            {questions.map((q, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: '#2c2c3e',
                  color: 'white',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}
                </Typography>
                <Typography>{q}</Typography>
              </Paper>
            ))}
          </Stack>
        )}

        <Box textAlign="center" mt={5}>
          <Button variant="contained" size="large" onClick={() => alert('Submitting soon!')}>
            Submit Answers
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
