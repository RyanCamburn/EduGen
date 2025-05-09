// ResultPage.jsx
import React, { useState } from 'react';
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
import logo from '../assets/logo.svg';
import axios from 'axios';
import { useEffect } from 'react';

export default function ResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { videoId, transcription, summary } = state || {};
  const [transcriptions, setTranscriptions] = useState([]);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        const res = await axios.get('http://localhost:3000/video/videos');
        setTranscriptions(res.data);
      } catch (err) {
        console.error('Failed to fetch transcriptions', err);
      }
    };
    fetchTranscriptions();
  }, [setTranscriptions]);

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
                {transcriptions.map((t, index) => (
                  <Button
                    key={t._id}
                    variant="outlined"
                    fullWidth
                    color="inherit"
                    onClick={() =>
                      navigate('/results', {
                        state: {
                          videoId: t._id,
                          transcription: t.transcription,
                          summary: t.summary,
                        },
                      })
                    }
                  >
                    {`Lecture ${index + 1}`}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Transcription and Summary Cards */}
          <Grid item xs={12} md={9}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
                flexWrap: 'wrap',
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: '#e0e0e0',
                  minHeight: '300px',
                  width: '350px',
                  textAlign: 'left',
                }}
              >
                <Typography variant="h6" gutterBottom color="black">
                  Video Transcription
                </Typography>
                <Typography color="black">{transcription || 'No data received.'}</Typography>
              </Paper>

              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: '#d4d4d4',
                  minHeight: '300px',
                  width: '350px',
                  textAlign: 'left',
                }}
              >
                <Typography variant="h6" gutterBottom color="black">
                  Video Summary
                </Typography>
                <Typography color="black">{summary || 'No data received.'}</Typography>
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
          <Button
            variant="contained"
            onClick={() => navigate('/quiz', { state: { videoId, transcription } })}
          >
            Generate Questions
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
