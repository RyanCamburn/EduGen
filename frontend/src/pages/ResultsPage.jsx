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

      {/* Content */}
      <Container sx={{ py: 5 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: '#e0e0e0', minHeight: '300px' }}>
              <Typography variant="h6" color="black" gutterBottom>
                Video Transcription
              </Typography>
              <Typography color="gray">
                Lorem ipsum dolor sit amet... (mock transcription text)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, backgroundColor: '#d4d4d4', minHeight: '300px' }}>
              <Typography variant="h6" color="black" gutterBottom>
                Video Summary
              </Typography>
              <Typography color="gray">
                Lorem ipsum dolor sit amet... (mock summary text)
              </Typography>
            </Paper>
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
