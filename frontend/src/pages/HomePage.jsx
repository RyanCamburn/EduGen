import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Container,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import logo from '../assets/logo.svg';

export default function HomePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setLoading(true);

    try {
      // 1. Transcribe
      const formData = new FormData();
      formData.append('file', file);

      const transcribeRes = await axios.post('http://localhost:3000/video/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const transcription = transcribeRes.data;

      // 2. Summarize
      const summaryRes = await axios.post('http://localhost:3000/video/summarize', {
        text: transcription,
      });

      const summary = summaryRes.data;

      // 3. Navigate to result page with both
      navigate('/results', {
        state: {
          transcription,
          summary,
        },
      });
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2c2c3e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background:
            'radial-gradient(circle at 20% 20%, rgba(100, 108, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Navbar */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'rgba(61, 61, 80, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <img src={logo} alt="Logo" style={{ width: 50, height: 50 }} />
            </Button>
            <Typography variant="h6" color="white" sx={{ fontWeight: 600 }}>
              EduGen
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/results')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Results
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container
        maxWidth="sm"
        sx={{ mt: 10, textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: '20px',
            background: 'rgba(44, 44, 62, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mb: 6,
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(45deg, #646cff, #535bf2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Summarize Lecture
          </Typography>
          <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 4 }}>
            Upload your lecture video or audio file to generate a comprehensive summary
          </Typography>

          <FileUpload onFileSelect={setFile} />

          <Button
            variant="contained"
            size="large"
            onClick={handleGenerate}
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.5,
              px: 4,
              background: 'linear-gradient(45deg, #646cff, #535bf2)',
              color: 'white',
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 4px 20px rgba(100, 108, 255, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #535bf2, #646cff)',
                boxShadow: '0 6px 25px rgba(100, 108, 255, 0.4)',
              },
              '&:disabled': {
                background: 'rgba(100, 108, 255, 0.3)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Summary'}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
