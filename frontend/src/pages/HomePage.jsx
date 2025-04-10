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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#1a1a2e' }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#3d3d50' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" size="small" onClick={() => navigate('/')}>
              <img src={logo} alt="Logo" style={{ width: 50, height: 50 }} />
            </Button>
            <Typography variant="h6" color="white">
              EduGen
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/results')}>
              Results
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Box
          sx={{
            backgroundColor: '#ccc',
            borderRadius: '30px',
            py: 3,
            mb: 4,
          }}
        >
          <Typography variant="h4" color="black" fontWeight="bold">
            Summarize Lecture
          </Typography>
        </Box>

        <FileUpload onFileSelect={setFile} />

        <Button variant="contained" size="large" onClick={handleGenerate} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate'}
        </Button>
      </Container>
    </Box>
  );
}
