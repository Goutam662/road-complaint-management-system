import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Home = () => {
  const { settings } = useSiteSettings();
  const cards = Array.isArray(settings.homeCards) && settings.homeCards.length ? settings.homeCards : [];
  const steps = Array.isArray(settings.howItWorks) && settings.howItWorks.length ? settings.howItWorks : [];
  const benefits = Array.isArray(settings.benefits) && settings.benefits.length ? settings.benefits : [];

  return (
    <div className="home-page gov-home-page">
      <section className="gov-hero">
        <div className="gov-hero-inner">
          <div className="gov-hero-copy">
            <h1>{settings.heroTitle}</h1>
            <p className="gov-hero-text">{settings.heroSubtitle}</p>
            <p className="gov-hero-subtext">{settings.heroDescription}</p>
            <div className="gov-hero-actions">
              <Link to="/register" className="btn btn-primary">Register Now</Link>
              <Link to="/map" className="btn btn-secondary">Track Complaints</Link>
            </div>
          </div>

          <div className="gov-hero-visual">
            <div className="gov-hero-image-card">
              <img src={settings.homeImage || settings.logoFallback} alt="Dashboard overview" />
            </div>
            <div className="gov-hero-secondary-card">
              <img src={settings.homeImage || settings.logoFallback} alt="Map view" />
            </div>
            <div className="gov-hero-tag">
              <img src={settings.logoImage || settings.logoFallback} alt="Road icon" />
              <span>Photo-based complaint submission and tracking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="gov-trust-strip">
        <div className="gov-trust-item">
          <strong>Fast Reporting</strong>
          <span>Submit issues in minutes</span>
        </div>
        <div className="gov-trust-item">
          <strong>Live Tracking</strong>
          <span>Monitor every update</span>
        </div>
        <div className="gov-trust-item">
          <strong>Public Transparency</strong>
          <span>See the road status clearly</span>
        </div>
      </section>

      <section className="gov-why-us">
        <div className="gov-section-header">
          <span className="gov-section-label">{settings.homeSectionSubtitle || 'Why choose this portal'}</span>
          <h2>{settings.homeSectionTitle || 'A professional platform for faster, clearer road maintenance.'}</h2>
        </div>
        <div className="gov-why-grid">
          {cards.map((card) => (
            <div key={card.title} className="gov-why-card">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="gov-how-it-works">
        <h2>How it works</h2>
        <div className="gov-how-grid">
          {steps.map((step) => (
            <div key={step.title} className="gov-how-item">
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="gov-benefits-section">
        <h2>Benefits of using the portal</h2>
        <ul className="gov-benefits-list">
          {benefits.map((benefit) => (
            <li key={benefit.title}><strong>{benefit.title}:</strong> {benefit.text}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;
