import React, { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';

export default function FileUpload({ onFileSelect }) {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Button variant="contained" component="label">
        Upload File
        <input type="file" accept=".mp4,.mp3" hidden onChange={handleFileChange} />
      </Button>
      {fileName && (
        <Typography variant="body2" color="white">
          Selected: {fileName}
        </Typography>
      )}
    </Stack>
  );
}
