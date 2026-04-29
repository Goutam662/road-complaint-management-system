import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Us</h1>
        <p>Learn more about the National Road Complaint System and our mission</p>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>To revolutionize infrastructure by empowering communities to maintain and improve their road networks using cutting-edge technology. We believe better roads lead to safer communities and enhanced quality of life.</p>
        </section>

        <section className="about-section">
          <h2>Our Vision</h2>
          <p>To become the leading digital platform for infrastructure management, connecting citizens with local and national authorities through transparent, efficient, and technology-driven solutions.</p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <ul>
            <li>User-Friendly Interface for easy complaint submission</li>
            <li>GPS Integration for precise location tracking</li>
            <li>Real-time Tracking and status updates</li>
            <li>Photo Upload capability for evidence documentation</li>
            <li>Admin Dashboard for comprehensive management</li>
            <li>Secure Authentication and data encryption</li>
            <li>Data Analytics and reporting</li>
            <li>Mobile-Responsive design</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <ol>
            <li><strong>Registration:</strong> Citizens create accounts with basic information</li>
            <li><strong>Complaint Submission:</strong> Upload photos, provide location, describe the issue</li>
            <li><strong>Auto-Analysis:</strong> System categorizes and prioritizes complaints</li>
            <li><strong>Admin Review:</strong> Administrators assess and assign resources</li>
            <li><strong>Resolution:</strong> Work orders are issued and repairs scheduled</li>
            <li><strong>Tracking:</strong> Citizens monitor progress through their dashboard</li>
          </ol>
        </section>

        <section className="about-section">
          <h2>Our Commitment</h2>
          <p>We are committed to providing a reliable, secure, and efficient platform that genuinely addresses the road infrastructure needs of our citizens. Our dedicated team works continuously to improve our services.</p>
        </section>
      </div>
    </div>
  );
};

export default About;
