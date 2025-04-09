import React from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function ResultPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: '#1a1a2e', minHeight: '100vh' }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#3d3d50' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button size="small" variant="contained" onClick={() => navigate('/')}>
              Logo
            </Button>
            <Typography variant="h6" color="white">
              EduGen
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => alert('Upload coming soon')}>
              Upload
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
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
                <Typography color="black">
                  Lorem ipsum dolor sit amet... (mock transcription text)
                </Typography>
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
                <Typography color="black">
                  Lorem ipsum dolor sit amet... (mock summary text)
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" mt={5}>
          <Button variant="contained" size="large">
            Download Result
          </Button>
          <Button variant="outlined" size="large">
            Generate Summary
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
