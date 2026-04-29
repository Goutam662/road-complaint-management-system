import React from 'react';
import { Link } from 'react-router-dom';
import roadBrokenImg from '../assets/icons/roadbroken.png';
import screenshot1 from '../assets/icons/Screenshot_2025-12-26_213013.png';
import screenshot2 from '../assets/icons/Screenshot_2025-12-26_213030.png';

const Home = () => {
  return (
    <div className="home-page gov-home-page">
      <section className="gov-hero">
        <div className="gov-hero-inner">
          <div className="gov-hero-copy">
            <h1>Improve Roads Faster with Trusted Citizen Reporting</h1>
            <p className="gov-hero-text">Submit issues, upload evidence, and monitor resolutions from a secure national portal built for transparency and accountability.</p>
            <p className="gov-hero-subtext">Designed to help citizens, local departments, and administrators work together to keep roads safe and service requests moving.</p>
            <div className="gov-hero-actions">
              <Link to="/register" className="btn btn-primary">Register Now</Link>
              <Link to="/map" className="btn btn-secondary">Track Complaints</Link>
            </div>
          </div>

          <div className="gov-hero-visual">
            <div className="gov-hero-image-card">
              <img src={screenshot1} alt="Dashboard overview" />
            </div>
            <div className="gov-hero-secondary-card">
              <img src={screenshot2} alt="Map view" />
            </div>
            <div className="gov-hero-tag">
              <img src={roadBrokenImg} alt="Road icon" />
              <span>Photo-based complaint submission and tracking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="gov-why-us">
        <div className="gov-section-header">
          <span className="gov-section-label">Why choose this portal</span>
          <h2>A professional platform for faster, clearer road maintenance.</h2>
        </div>
        <div className="gov-why-grid">
          <div className="gov-why-card">
            <h3>Trusted by communities</h3>
            <p>Designed for citizens and authorities to collaborate on road safety and maintenance workflows.</p>
          </div>
          <div className="gov-why-card">
            <h3>Verified reporting</h3>
            <p>Capture photos, location data, and issue details to help responders act quickly and accurately.</p>
          </div>
          <div className="gov-why-card">
            <h3>Clear status updates</h3>
            <p>Track complaint progress from submission to resolution with transparent status notifications.</p>
          </div>
          <div className="gov-why-card">
            <h3>Data-driven action</h3>
            <p>Use complaint insights and reports to prioritize repairs and improve resource allocation.</p>
          </div>
        </div>
      </section>

      <section className="gov-how-it-works">
        <h2>How it works</h2>
        <div className="gov-how-grid">
          <div className="gov-how-item">
            <h4>1. Register or login</h4>
            <p>Create your account to begin logging road issues in your area.</p>
          </div>
          <div className="gov-how-item">
            <h4>2. Submit complaint</h4>
            <p>Provide location details, upload evidence, and describe the problem clearly.</p>
          </div>
          <div className="gov-how-item">
            <h4>3. Monitor status</h4>
            <p>Receive updates and follow the progress until the issue is resolved.</p>
          </div>
          <div className="gov-how-item">
            <h4>4. Confirm resolution</h4>
            <p>Verify that repairs are complete and help maintain accountability.</p>
          </div>
        </div>
      </section>

      <section className="gov-benefits-section">
        <h2>Benefits of using the portal</h2>
        <ul className="gov-benefits-list">
          <li><strong>Fast reporting:</strong> Submit road complaints in seconds with photos and location details.</li>
          <li><strong>Transparent tracking:</strong> Follow progress with clear status updates and timestamps.</li>
          <li><strong>Community impact:</strong> Empower your village to participate in safer, better roads.</li>
          <li><strong>Responsive workflow:</strong> Support administrators with structured complaint management.</li>
          <li><strong>Data insights:</strong> Improve planning with complaint analytics and reporting.</li>
          <li><strong>Trusted process:</strong> Built for government use with accountability and verification features.</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
