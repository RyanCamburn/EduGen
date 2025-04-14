import React, { useState } from 'react';
import { Button, Stack, Typography, Alert } from '@mui/material';

export default function FileUpload({ onFileSelect }) {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setError(''); // Clear any previous errors

    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 100MB limit. Please choose a smaller file.');
        setFileName('');
        onFileSelect(null);
        return;
      }

      // Check file type
      const fileType = file.type;
      if (!fileType.includes('video/') && !fileType.includes('audio/')) {
        setError('Invalid file type. Please upload an MP4 or MP3 file.');
        setFileName('');
        onFileSelect(null);
        return;
      }

      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Button variant="contained" component="label">
        Upload File
        <input 
          type="file" 
          accept=".mp4,.mp3" 
          hidden 
          onChange={handleFileChange}
        />
      </Button>
      {fileName && (
        <Typography variant="body2" color="white">
          Selected: {fileName}
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: '400px' }}>
          {error}
        </Alert>
      )}
    </Stack>
  );
}
