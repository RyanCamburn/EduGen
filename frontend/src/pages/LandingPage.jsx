import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function EduGenLanding() {
  const navigate = useNavigate();
  return (
    <div className="edugen-landing">
      <div className="hero-section">
        <header className="hero">
          <h1 className="title">EduGen</h1>
          <p className="subtitle">
            AI-powered learning experiences. Accessible. Effective. Efficient.
          </p>
          <button className="cta-button" onClick={() => navigate('/home')}>
            Get Started
          </button>
        </header>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>Instant Feedback</h3>
          <p>
            Real-time AI feedback on quizzes and study paths, helping you learn faster and more
            effectively.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Smart Learning</h3>
          <p>
            Personalized learning paths powered by advanced AI algorithms to match your learning
            style.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💡</div>
          <h3>Our Mission</h3>
          <p>
            Providing an efficient learning experience through intelligent, accessible, and
            empowering tools for students, teachers, and lifelong learners.
          </p>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Transform Your Learning?</h2>
        <button className="cta-button secondary" onClick={() => navigate('/home')}>
          Start Learning Now
        </button>
      </div>
    </div>
  );
}

export default EduGenLanding;
