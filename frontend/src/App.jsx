import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import HomePage from './pages/HomePage.jsx';
import ResultPage from './pages/ResultsPage.jsx';

export default function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultPage />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}
