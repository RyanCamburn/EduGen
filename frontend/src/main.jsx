import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ResultPage from './pages/ResultsPage.jsx';
import EduGenLanding from './pages/LandingPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1a2e',
      paper: '#2a2a3e',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<EduGenLanding />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/results" element={<ResultPage />} />
          <Route path="/quiz" element={<QuizPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);