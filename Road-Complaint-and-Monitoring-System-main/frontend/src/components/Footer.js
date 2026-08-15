import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();

  return (
    <footer className="gov-footer">
      <div className="gov-footer-top">
        <div className="gov-footer-column">
          <h4>About Portal</h4>
          <p>{settings.siteName} is the official platform for citizens to report road maintenance issues and track government action.</p>
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
          <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
          <span>{settings.footerText}</span>
        </div>
      </div>
      <div className="gov-footer-bottom">
        <p>&copy; {currentYear} {settings.siteName} | {settings.footerText}</p>
        <p>Designed and developed by Goutam Meenia</p>
      </div>
    </footer>
  );
};

export default Footer;
