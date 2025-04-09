import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Container,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload.jsx';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#1a1a2e' }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: '#3d3d50' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" size="small" onClick={() => navigate('/')}>
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

        <FileUpload />
        <Button variant="contained" size="large" padding="10px">
          Generate
        </Button>
      </Container>
    </Box>
  );
}
