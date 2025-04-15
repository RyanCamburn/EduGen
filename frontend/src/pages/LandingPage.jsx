import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

function EduGenLanding() {
  const navigate = useNavigate();
  return (
    <div className="edugen-landing">
      <header className="hero">
        <h1>EduGen</h1>
        <p>AI-powered learning experiences. Accessible. Effective. Efficient.</p>
      </header>
      <button className="cta-button" onClick={() => navigate("/home")}>
          Get Started
        </button>
        <div className="infoRow">
      <section className="features">
        <div className="feature">
          <h3> Instant Feedback</h3>
          <p>Real-time AI feedback on quizzes, and study paths.</p>
        </div>
        <div className="feature">
        <h3>Our Mission</h3>
        <p>Our mission is to provide an efficient learning experience through intelligent, accessible, and empowering tools for students, teachers, and lifelong learners.</p>
        </div>
      </section>
      </div>
    </div>
  );
}

export default EduGenLanding;
