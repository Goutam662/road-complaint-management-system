import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gov-footer">
      <div className="gov-footer-top">
        <div className="gov-footer-column">
          <h4>About Portal</h4>
          <p>National Road Complaint Portal is the official platform for citizens to report road maintenance issues and track government action.</p>
        </div>
        <div className="gov-footer-column">
          <h4>Quick Access</h4>
          <a href="/register">Register</a>
          <a href="/map">Complaint Map</a>
          <a href="/contact">Contact Us</a>
        </div>
        <div className="gov-footer-column">
          <h4>Admin Section</h4>
          <a href="/admin/login">Admin Login</a>
          <a href="/admin">Admin Dashboard</a>
          <a href="/dashboard">User Dashboard</a>
        </div>
        <div className="gov-footer-column">
          <h4>Official Contacts</h4>
          <a href="mailto:support@roadcomplaint.gov.in">support@roadcomplaint.gov.in</a>
          <a href="tel:+911234567890">+91 12345 67890</a>
          <span>Ministry of Road Transport & Highways</span>
        </div>
      </div>
      <div className="gov-footer-bottom">
        <p>&copy; {currentYear} National Road Complaint Portal | Ministry of Road Transport & Highways</p>
        <p>Designed and developed by Goutam Meenia</p>
      </div>
    </footer>
  );
};

export default Footer;
