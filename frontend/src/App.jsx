import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EduGenLanding from "./pages/LandingPage.jsx"; 
import HomePage from "./pages/HomePage.jsx"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EduGenLanding />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
