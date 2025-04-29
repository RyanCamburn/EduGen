import React, { useState } from 'react';
import { Button, Stack, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function FileUpload({ onFileSelect }) {
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.includes('video') || file.type.includes('audio'))) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <Stack spacing={2} alignItems="center" width="100%">
      <Paper
        elevation={0}
        sx={{
          p: 3,
          width: '100%',
          border: '2px dashed',
          borderColor: isDragging ? '#646cff' : 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#646cff',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Stack spacing={2} alignItems="center">
          <CloudUploadIcon sx={{ fontSize: 48, color: '#646cff' }} />
          <Typography variant="h6" color="white" sx={{ fontWeight: 500 }}>
            Drag & Drop your file here
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
            or
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{
              background: 'linear-gradient(45deg, #646cff, #535bf2)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #535bf2, #646cff)',
              },
            }}
          >
            Choose File
            <input type="file" accept=".mp4,.mp3" hidden onChange={handleFileChange} />
          </Button>
          <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
            Supported formats: MP4, MP3
          </Typography>
        </Stack>
      </Paper>
      {fileName && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            width: '100%',
            backgroundColor: 'rgba(100, 108, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(100, 108, 255, 0.2)',
          }}
        >
          <Typography variant="body2" color="white" sx={{ fontWeight: 500 }}>
            Selected: {fileName}
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
