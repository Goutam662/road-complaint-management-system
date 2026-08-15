import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { settings } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdminUser = Boolean(user && ['admin', 'superadmin'].includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="gov-header">
        <div className="gov-brand">
          <div className="gov-logo">
            <div className="gov-logo-icon">
              {settings.logoImage ? (
                <img src={settings.logoImage} alt={settings.siteName} className="site-logo-image" />
              ) : (
                <img src={settings.logoFallback} alt={settings.siteName} className="site-logo-image" />
              )}
            </div>
            <div className="gov-brand-copy">
              <h1>{settings.siteName}</h1>
              <p>{settings.siteTagline}</p>
            </div>
          </div>
          <button type="button" className="gov-portal-btn">e-Portal</button>
        </div>
      </header>

      <nav className="gov-nav">
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>

        <ul className={`gov-nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/map">View Status</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/help">Help & Support</Link></li>
          {!isAuthenticated && <li><Link to="/admin/login">Admin Login</Link></li>}
          {isAuthenticated && !isAdminUser && <li><Link to="/dashboard">Dashboard</Link></li>}
          {isAuthenticated && !isAdminUser && <li><Link to="/upload">Submit Complaint</Link></li>}
          {isAuthenticated && isAdminUser && <li><Link to="/admin">Admin Dashboard</Link></li>}
          {isAuthenticated && <li><button className="btn-logout" onClick={handleLogout}>Logout</button></li>}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
